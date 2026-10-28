import axios from "axios"
import { serverUrl } from "../config"
import { setUserData } from "../redux/userSlice"

export const getCurrentUser = async (dispatch) => {
    try {
        const result = await axios.get(serverUrl + "/api/user/currentuser", {
            withCredentials: true
        })
        dispatch(setUserData(result.data))
        return result.data
    } catch {
        return null
    }
}

export const uploadScannedNotes = async (formData) => {
    const result = await axios.post(serverUrl + "/api/notes/upload-images", formData, { withCredentials: true })
    return result.data
}

export const downloadScannedPdf = async (noteId) => {
    const result = await axios.get(serverUrl + `/api/notes/${noteId}/source-pdf`, { responseType: "blob", withCredentials: true })
    return result.data
}

export const generateScannedQuestionPaper = async (noteId) => {
    const result = await axios.post(serverUrl + `/api/notes/${noteId}/question-paper`, {}, { responseType: "blob", withCredentials: true })
    return { blob: result.data, creditsLeft: Number(result.headers["x-credits-left"]) }
}

export const askVoiceTutor = async (noteId) => {
    const result = await axios.post(serverUrl + `/api/notes/${noteId}/voice-tutor/question`, {}, { withCredentials: true })
    return result.data
}

export const evaluateVoiceAnswer = async (noteId, question, answer) => {
    const result = await axios.post(serverUrl + `/api/notes/${noteId}/voice-tutor/answer`, { question, answer }, { withCredentials: true })
    return result.data
}

export const confirmCreditsPurchase = async (sessionId) => {
    try {
        const result = await axios.post(
            serverUrl + "/api/credit/confirm",
            { sessionId },
            { withCredentials: true }
        )
        return result.data
    } catch {
        return null
    }
}

export const generateNotesQuiz = async (noteId) => {
    try {
        const result = await axios.post(
            serverUrl + `/api/notes/${noteId}/quiz`,
            {},
            { withCredentials: true }
        )
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Quiz generation failed. Please try again." }
    }
}

export const getQuizAttempt = async (attemptId) => {
    try {
        const result = await axios.get(serverUrl + `/api/quiz/attempts/${attemptId}`, { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not load this quiz." }
    }
}

export const submitQuizAttempt = async (attemptId, answers) => {
    try {
        const result = await axios.post(serverUrl + `/api/quiz/attempts/${attemptId}/submit`, { answers }, { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not save quiz result." }
    }
}

export const getQuizResults = async () => {
    try {
        const result = await axios.get(serverUrl + "/api/quiz/results", { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not load quiz results." }
    }
}

export const createPartyQuiz = async (noteId) => {
    try {
        const result = await axios.post(serverUrl + "/api/party-quiz", { noteId }, { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not create the room." }
    }
}

export const getPartyQuiz = async (code) => {
    try {
        const result = await axios.get(serverUrl + `/api/party-quiz/${code}`, { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not load this room." }
    }
}

export const joinPartyQuiz = async (code) => {
    try {
        const result = await axios.post(serverUrl + `/api/party-quiz/${code}/join`, {}, { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not join this room." }
    }
}

export const startPartyQuiz = async (code) => {
    try {
        const result = await axios.post(serverUrl + `/api/party-quiz/${code}/start`, {}, { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not start this quiz." }
    }
}

export const submitPartyQuiz = async (code, answers) => {
    try {
        const result = await axios.post(serverUrl + `/api/party-quiz/${code}/submit`, { answers }, { withCredentials: true })
        return result.data
    } catch (error) {
        return { message: error.response?.data?.message || "Could not submit your answers." }
    }
}

export const generateNotes = async (payload) => {
    try {
        const result = await axios.post(serverUrl + "/api/notes/generate-notes", payload, { withCredentials: true })
        return result.data
    } catch (error) {
        console.log(error.response?.data) // 👈 ADD THIS
        throw error
    }
}

export const downloadPdf = async (result) => {
    try {
        const response = await axios.post(serverUrl + "/api/pdf/generate-pdf", { result }, {
            responseType: "blob", // Essential for binary data
            withCredentials: true
        });

        const blob = new Blob([response.data], {
            type: "application/pdf"
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ExamNotesAI.pdf";
        link.click();
        window.URL.revokeObjectURL(url);
    } catch {
        throw new Error("PDF download failed");
    }
} 
