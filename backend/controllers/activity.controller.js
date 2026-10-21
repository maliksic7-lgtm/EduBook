const Book = require('../models/Book');
const Activity = require('../models/Activity');
const aiService = require('../services/aiService');
const streamService = require('../services/streamService');
const SUBJECTS = require('../seeds/subjects');

const SUBJECT_ID_PATTERN = /^[a-z0-9_]{2,60}$/;

function parseSubjectId(value) {
    if (value === undefined || value === null || value === '') return { ok: true, value: null };
    if (typeof value !== 'string') return { ok: false, value: null };
    const id = value.trim().toLowerCase();
    return SUBJECT_ID_PATTERN.test(id) ? { ok: true, value: id } : { ok: false, value: null };
}

function subjectNameById(subjectId) {
    if (!subjectId) return 'Mapel Lainnya';
    const found = SUBJECTS.find(s => s.subject_id === subjectId);
    return found ? found.nama : subjectId;
}

function getStudentName(req) {
    if (req.user?.nama) return req.user.nama;
    const value = req.body?.student_name || req.params?.student;
    if (typeof value !== 'string') return null;
    const name = value.trim();
    return name.length >= 1 && name.length <= 100 ? name : null;
}

function normalizeStudentName(value) {
    if (typeof value !== 'string') return null;
    const studentName = value.trim();
    return studentName.length >= 1 && studentName.length <= 100 ? studentName : null;
}

function parsePage(value) {
    const page = Number(value);
    return Number.isInteger(page) && page >= 1 && page <= 10 ? page : null;
}

function normalizeText(value, maxLength = 10000) {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') return null;
    const text = value.trim();
    return text.length <= maxLength ? text : null;
}

function clampScore(value) {
    const score = Number(value);
    return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0;
}

function isQuizActivity(log) {
    return log.activity_type === 'quiz' || log.activity_type === 'listening' || (
        !log.activity_type &&
        log.hafalan_features?.feedback_text?.includes('[KUIS_OBJEKTIF]')
    );
}

async function submitHafalanActivity(req, res) {
    try {
        const { page, current_page, paragraph_id, text_to_evaluate, text_hafalan, book_text, subject_id } = req.body;
        const studentName = getStudentName(req);
        const targetPage = parsePage(page ?? current_page);
        const suaraSiswa = normalizeText(text_to_evaluate ?? text_hafalan);
        const suppliedBookText = normalizeText(book_text);
        const subject = parseSubjectId(subject_id);

        if (!studentName || !targetPage) {
            return res.status(400).json({ message: 'student_name dan nomor halaman diperlukan.' });
        }
        if (!subject.ok) {
            return res.status(400).json({ message: 'subject_id tidak valid.' });
        }
        if (suaraSiswa === null || suppliedBookText === null) {
            return res.status(400).json({ message: 'Teks aktivitas tidak valid atau terlalu panjang.' });
        }

        let finalScore = 0;
        let feedbackText = "Belum ada setoran hafalan.";
        let textAcuanPencocokan = suppliedBookText;
        let selectedParagraphId;

        if (paragraph_id !== undefined && paragraph_id !== null) {
            selectedParagraphId = Number(paragraph_id);
            if (!Number.isInteger(selectedParagraphId) || selectedParagraphId < 1) {
                return res.status(400).json({ message: 'paragraph_id tidak valid.' });
            }

            const bukuDitemukan = await Book.findOne({
                page_number: targetPage,
                ...(subject.value ? { subject_id: subject.value } : {})
            });
            const paragrafCocok = bukuDitemukan?.paragraphs?.find(
                paragraph => paragraph.paragraph_id === selectedParagraphId
            );

            if (!paragrafCocok) {
                return res.status(400).json({ message: 'Paragraf target tidak ditemukan.' });
            }

            textAcuanPencocokan = paragrafCocok.text;
        }

        if (suaraSiswa && suaraSiswa.trim() !== "") {
            const aiResponse = await aiService.evaluateHafalan(textAcuanPencocokan, suaraSiswa);
            finalScore = clampScore(aiResponse?.score);
            feedbackText = typeof aiResponse?.feedback_text === 'string'
                ? aiResponse.feedback_text.trim().slice(0, 1000)
                : 'Evaluasi selesai.';
        } else {
            feedbackText = "Tidak ada rekaman suara yang terdeteksi. Silakan coba rekam ulang hafalan Anda.";
        }

        const newActivity = new Activity({
            student_name: studentName,
            activity_type: 'hafalan',
            subject_id: subject.value,
            current_page: targetPage,
            paragraph_id: selectedParagraphId,
            duration_minutes: 3,
            text_hafalan: suaraSiswa || "",
            hafalan_features: { is_submitted: true, feedback_text: feedbackText, score: finalScore }
        });

        await newActivity.save();
        streamService.broadcast({ type: 'NEW_ACTIVITY', data: newActivity });

        res.status(201).json(newActivity);
    } catch (error) {
        console.error("Error di submitHafalanActivity:", error);
        res.status(500).json({ error: error.message });
    }
}

async function submitQuizActivity(req, res) {
    try {
        const { page, score, total_soal, subject_id } = req.body;
        const studentName = getStudentName(req);
        const pageNumber = parsePage(page);
        const finalScore = Number(score);
        const totalQuestionsInput = Number(total_soal);
        const subject = parseSubjectId(subject_id);

        if (!studentName || !pageNumber) {
            return res.status(400).json({ message: 'student_name dan page diperlukan.' });
        }
        if (!subject.ok) {
            return res.status(400).json({ message: 'subject_id tidak valid.' });
        }
        if (!Number.isFinite(finalScore) || finalScore < 0 || finalScore > 100) {
            return res.status(400).json({ message: 'score harus berupa angka antara 0 dan 100.' });
        }
        if (!Number.isInteger(totalQuestionsInput) || totalQuestionsInput < 1 || totalQuestionsInput > 100) {
            return res.status(400).json({ message: 'total_soal tidak valid.' });
        }

        const totalQuestions = totalQuestionsInput;
        const feedbackText = await aiService.evaluateQuizFeedback(
            studentName,
            pageNumber,
            Math.round(finalScore),
            totalQuestions
        );

        const quizActivity = new Activity({
            student_name: studentName,
            activity_type: 'quiz',
            subject_id: subject.value,
            current_page: pageNumber,
            quiz_total_questions: totalQuestions,
            duration_minutes: 5,
            hafalan_features: {
                is_submitted: true,
                feedback_text: feedbackText,
                score: Math.round(finalScore)
            }
        });

        await quizActivity.save();
        streamService.broadcast({ type: 'NEW_ACTIVITY', data: quizActivity });

        res.status(201).json(quizActivity);
    } catch (error) {
        console.error("Error di submitQuizActivity:", error);
        res.status(500).json({ message: 'Server Error kuis', error: error.message });
    }
}

async function submitListeningActivity(req, res) {
    try {
        const { page, score, total_soal, listened_paragraphs, subject_id } = req.body;
        const studentName = getStudentName(req);
        const pageNumber = parsePage(page);
        const finalScore = Number(score);
        const totalQuestionsInput = Number(total_soal);
        const subject = parseSubjectId(subject_id);

        if (!studentName || !pageNumber) {
            return res.status(400).json({ message: 'student_name dan page diperlukan.' });
        }
        if (!subject.ok) {
            return res.status(400).json({ message: 'subject_id tidak valid.' });
        }
        if (!Number.isFinite(finalScore) || finalScore < 0 || finalScore > 100) {
            return res.status(400).json({ message: 'score harus berupa angka antara 0 dan 100.' });
        }
        if (!Number.isInteger(totalQuestionsInput) || totalQuestionsInput < 1 || totalQuestionsInput > 100) {
            return res.status(400).json({ message: 'total_soal tidak valid.' });
        }

        const totalQuestions = totalQuestionsInput;
        const feedbackText = await aiService.evaluateQuizFeedback(
            studentName,
            pageNumber,
            Math.round(finalScore),
            totalQuestions
        );

        const listeningActivity = new Activity({
            student_name: studentName,
            activity_type: 'listening',
            subject_id: subject.value,
            current_page: pageNumber,
            quiz_total_questions: totalQuestions,
            duration_minutes: 8,
            text_hafalan: listened_paragraphs || '',
            hafalan_features: {
                is_submitted: true,
                feedback_text: feedbackText,
                score: Math.round(finalScore)
            }
        });

        await listeningActivity.save();
        streamService.broadcast({ type: 'NEW_ACTIVITY', data: listeningActivity });

        res.status(201).json(listeningActivity);
    } catch (error) {
        console.error("Error di submitListeningActivity:", error);
        res.status(500).json({ message: 'Server Error listening', error: error.message });
    }
}

async function getActivityHistory(req, res) {
    try {
        const studentName = getStudentName(req);
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan.' });
        const history = await Activity.find({ student_name: studentName }).sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAnalytics(req, res) {
    try {
        const studentName = getStudentName(req);
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan.' });

        const logs = await Activity.find({ student_name: studentName }).lean();

        // Diringkas lewat aggregation: cukup kirim page_number/title/subject_id
        // dan JUMLAH soal per halaman, bukan seluruh array quiz_questions.
        const bookDocs = await Book.aggregate([
            {
                $project: {
                    _id: 0,
                    page_number: 1,
                    title: 1,
                    subject_id: 1,
                    quiz_count: { $size: { $ifNull: ['$quiz_questions', []] } }
                }
            }
        ]);

        const bookKey = (subjectId, page) => `${subjectId || 'umum'}|${page}`;

        const bookQuizCountMap = {};
        const bookTitleMap = {};
        bookDocs.forEach(b => {
            const key = bookKey(b.subject_id, b.page_number);
            bookQuizCountMap[key] = b.quiz_count || 0;
            bookTitleMap[key] = b.title || `Halaman ${b.page_number}`;
        });

        let totalDuration = 0;
        let totalQuizScore = 0;
        let quizCount = 0;
        let totalHafalanScore = 0;
        let hafalanCount = 0;
        let totalListeningScore = 0;
        let listeningCount = 0;
        let listeningCorrectSoal = 0;
        let listeningTotalSoal = 0;
        let listeningBestScore = 0;

        let correctQuestions = 0;
        let totalAttemptedQuestionsPool = 0;

        const quizWeeklyCounts = [0, 0, 0, 0, 0, 0, 0];
        const hafalanWeeklyCounts = [0, 0, 0, 0, 0, 0, 0];
        const listeningWeeklyCounts = [0, 0, 0, 0, 0, 0, 0];

        const pageScores = {};
        const quizPageScores = {};
        const listeningDates = new Set();
        const quizDates = new Set();
        const hafalanDates = new Set();

        const perSubject = {};
        const getSubjectBucket = (subjectId) => {
            const id = subjectId || 'lainnya';
            if (!perSubject[id]) {
                perSubject[id] = {
                    subject_id: id,
                    hafalan_count: 0, hafalan_score_total: 0, hafalan_best: 0,
                    quiz_count: 0, quiz_score_total: 0, quiz_best: 0,
                    listening_count: 0, listening_score_total: 0, listening_best: 0,
                    total_activities: 0
                };
            }
            return perSubject[id];
        };

        const calcStreak = (dates) => {
            const sorted = [...dates].sort((a, b) => new Date(a) - new Date(b));
            let best = 0, cur = 0;
            for (let i = 0; i < sorted.length; i++) {
                if (i === 0) { cur = 1; }
                else {
                    const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / (86400000);
                    if (Math.round(diff) === 1) cur++;
                    else cur = 1;
                }
                best = Math.max(best, cur);
            }
            return best;
        };

        logs.forEach(log => {
            const date = new Date(log.timestamp);
            const dayIndex = date.getDay();
            const page = log.current_page || log.page || 1;
            const subjectId = log.subject_id || null;
            const subjectPageKey = bookKey(subjectId, page);
            const dayStr = date.toDateString();
            const bucket = getSubjectBucket(subjectId);

            const score = log.hafalan_features?.score || 0;
            bucket.total_activities += 1;

            if (log.activity_type === 'listening') {
                listeningCount++;
                totalListeningScore += score;
                listeningWeeklyCounts[dayIndex] += 1;
                totalDuration += log.duration_minutes || 8;
                listeningDates.add(dayStr);
                if (score > listeningBestScore) listeningBestScore = score;

                bucket.listening_count++;
                bucket.listening_score_total += score;
                if (score > bucket.listening_best) bucket.listening_best = score;

                const totalSoal = log.total_soal || 25;
                listeningTotalSoal += totalSoal;
                listeningCorrectSoal += Math.round((score / 100) * totalSoal);
            } else if (isQuizActivity(log)) {
                quizCount++;
                totalQuizScore += score;
                quizWeeklyCounts[dayIndex] += 1;
                totalDuration += log.duration_minutes || 5;
                quizDates.add(dayStr);

                bucket.quiz_count++;
                bucket.quiz_score_total += score;
                if (score > bucket.quiz_best) bucket.quiz_best = score;

                const questionsInThisPage = log.quiz_total_questions || bookQuizCountMap[subjectPageKey] || 0;
                correctQuestions += Math.round((score / 100) * questionsInThisPage);
                totalAttemptedQuestionsPool += questionsInThisPage;

                if (!quizPageScores[subjectPageKey]) quizPageScores[subjectPageKey] = [];
                quizPageScores[subjectPageKey].push(score);
            } else {
                hafalanCount++;
                totalHafalanScore += score;
                totalDuration += log.duration_minutes || 3;
                hafalanWeeklyCounts[dayIndex] += 1;
                hafalanDates.add(dayStr);

                bucket.hafalan_count++;
                bucket.hafalan_score_total += score;
                if (score > bucket.hafalan_best) bucket.hafalan_best = score;

                if (!pageScores[subjectPageKey]) pageScores[subjectPageKey] = [];
                pageScores[subjectPageKey].push(score);
            }
        });

        const avgHafalan = hafalanCount > 0 ? Math.round(totalHafalanScore / hafalanCount) : 0;
        const quizPrecision = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;
        const listeningPrecision = listeningCount > 0 ? Math.round(totalListeningScore / listeningCount) : 0;

        const hafalanStreak = calcStreak(hafalanDates);
        const quizStreak = calcStreak(quizDates);
        const listeningStreak = calcStreak(listeningDates);

        const maxHafalanScore = hafalanCount > 0 ? Math.max(...logs.filter(l => !isQuizActivity(l) && l.hafalan_features?.score).map(l => l.hafalan_features.score)) : 0;
        const maxQuizScore = quizCount > 0 ? Math.max(...logs.filter(l => isQuizActivity(l) && l.hafalan_features?.score).map(l => l.hafalan_features.score)) : 0;

        const listeningXp = listeningCount * 10;
        const quizXp = correctQuestions * 5;
        const hafalanXp = hafalanCount * 15;

        let strongestPage = null;
        let strongestScore = -1;
        let weakestPage = null;
        let weakestScore = 101;

        for (const page in pageScores) {
            const scores = pageScores[page];
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (avg > strongestScore) { strongestScore = avg; strongestPage = page; }
            if (avg < weakestScore) { weakestScore = avg; weakestPage = page; }
        }

        if (strongestPage === null) {
            for (const page in quizPageScores) {
                const scores = quizPageScores[page];
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                if (avg > strongestScore) { strongestScore = avg; strongestPage = page; }
                if (avg < weakestScore) { weakestScore = avg; weakestPage = page; }
            }
        }

        const strongestPageTitle = strongestPage ? bookTitleMap[strongestPage] || `Halaman ${strongestPage}` : "None";
        const weakestPageTitle = weakestPage ? bookTitleMap[weakestPage] || `Halaman ${weakestPage}` : "None";

        const subjectStats = Object.values(perSubject).map(b => ({
            subject_id: b.subject_id,
            subject_name: subjectNameById(b.subject_id === 'lainnya' ? null : b.subject_id),
            hafalan_count: b.hafalan_count,
            hafalan_avg: b.hafalan_count ? Math.round(b.hafalan_score_total / b.hafalan_count) : 0,
            hafalan_best: b.hafalan_best,
            quiz_count: b.quiz_count,
            quiz_avg: b.quiz_count ? Math.round(b.quiz_score_total / b.quiz_count) : 0,
            quiz_best: b.quiz_best,
            listening_count: b.listening_count,
            listening_avg: b.listening_count ? Math.round(b.listening_score_total / b.listening_count) : 0,
            listening_best: b.listening_best,
            total_activities: b.total_activities,
            xp: b.hafalan_count * 15 + b.quiz_count * 5 + b.listening_count * 10
        })).sort((a, b) => b.total_activities - a.total_activities);

        res.json({
            total_learning_time: totalDuration,
            quiz_precision: quizPrecision,
            avg_hafalan: avgHafalan,
            listening_precision: listeningPrecision,
            quiz_correct_soal: correctQuestions,
            quiz_total_soal: totalAttemptedQuestionsPool,
            listening_total_soal: listeningTotalSoal,
            listening_correct_soal: listeningCorrectSoal,
            listening_best_score: listeningBestScore,
            listening_streak: listeningStreak,
            listening_xp: listeningXp,
            quiz_streak: quizStreak,
            quiz_best_score: maxQuizScore,
            quiz_xp: quizXp,
            hafalan_streak: hafalanStreak,
            hafalan_best_score: maxHafalanScore,
            hafalan_xp: hafalanXp,
            hafalan_weekly_chart: hafalanWeeklyCounts,
            quiz_weekly_chart: quizWeeklyCounts,
            listening_weekly_chart: listeningWeeklyCounts,
            strongest_page_title: strongestPageTitle,
            weakest_page_title: weakestPageTitle,
            subject_stats: subjectStats,
            total_activities: logs.length
        });

    } catch (err) {
        console.error("Error di getAnalytics:", err);
        res.status(500).json({ error: "Gagal memproses analitik real-time: " + err.message });
    }
}

async function getRecommendation(req, res) {
    try {
        const studentName = getStudentName(req);
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan.' });
        const logs = await Activity.find({ student_name: studentName });

        if (!logs || logs.length === 0) {
            return res.json({
                status: "success",
                recommendation: `👋 Halo ${studentName}! Log aktivitas belajarmu di MongoDB masih kosong nih. Yuk, coba kerjain menu "3. Tantangan Kuis" atau "2. Smart-Review Lisan" terlebih dahulu agar EduBot AI dapat merumuskan taktik belajar yang cocok untukmu! 🚀`
            });
        }

        let totalHafalanScore = 0, hafalanCount = 0;
        let totalQuizScore = 0, quizCount = 0;

        logs.forEach(log => {
            const isQuiz = isQuizActivity(log);
            const score = log.hafalan_features?.score || 0;

            if (isQuiz) { quizCount++; totalQuizScore += score; }
            else { hafalanCount++; totalHafalanScore += score; }
        });

        const avgHafalan = hafalanCount > 0 ? Math.round(totalHafalanScore / hafalanCount) : 0;
        const avgQuiz = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;

        const aiReply = await aiService.generateRecommendation(studentName, {
            avgHafalan, hafalanCount, avgQuiz, quizCount, totalLogs: logs.length
        }, req.user?.jenis_kelamin);

        res.json({ status: "success", student_name: studentName, recommendation: aiReply });

    } catch (err) {
        console.error("🚨 Error di getRecommendation:", err);
        res.status(500).json({ error: "Gagal menyusun taktik belajar AI: " + err.message });
    }
}

// Endpoint ini sudah diamankan oleh middleware requireAdminKey (x-admin-key header).
async function dangerResetStudentData(req, res) {
    try {
        const studentName = getStudentName(req);
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan.' });
        const result = await Activity.deleteMany({ student_name: studentName });
        res.json({
            message: 'Data aktivitas berhasil dihapus.',
            student_name: studentName,
            deleted_count: result.deletedCount
        });
    } catch (err) {
        res.status(500).send("Gagal reset data: " + err.message);
    }
}

module.exports = {
    submitHafalanActivity,
    submitQuizActivity,
    submitListeningActivity,
    getActivityHistory,
    getAnalytics,
    getRecommendation,
    dangerResetStudentData
};
