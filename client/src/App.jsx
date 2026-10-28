import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { useEffect } from "react";
import { getCurrentUser } from "./services/api";
import { useDispatch, useSelector } from "react-redux";
import History from "./pages/History";
import Notes from "./pages/Notes";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import AccountSettings from "./pages/AccountSettings";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import StudyParty from "./pages/StudyParty";
import PartyRoom from "./pages/PartyRoom";
import UploadNotes from "./pages/UploadNotes";
import VoiceTutor from "./pages/VoiceTutor";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    getCurrentUser(dispatch);
  }, [dispatch]);

  const { userData } = useSelector((state) => state.user);
  const authNext = new URLSearchParams(window.location.search).get("next");
  const safeAuthNext = authNext?.startsWith("/party/") ? authNext : "/";

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/auth"
          element={userData ? <Navigate to={safeAuthNext} replace /> : <Auth />}
        />

        <Route
          path="/history"
          element={userData ? <History /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/notes"
          element={userData ? <Notes /> : <Navigate to="/auth" replace />}
        />
        <Route path="/upload-notes" element={userData ? <UploadNotes /> : <Navigate to="/auth" replace />} />
        <Route path="/voice-tutor" element={userData ? <VoiceTutor /> : <Navigate to="/auth" replace />} />
        <Route
          path="/pricing"
          element={userData ? <Pricing /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/settings"
          element={userData ? <AccountSettings /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/quiz/:attemptId"
          element={userData ? <Quiz /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/quiz-results"
          element={userData ? <QuizResults /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/study-party"
          element={userData ? <StudyParty /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/party/:code"
          element={userData ? <PartyRoom /> : <Navigate to={`/auth?next=${encodeURIComponent(window.location.pathname)}`} replace />}
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
      </Routes>
    </>
  );
}

export default App;
