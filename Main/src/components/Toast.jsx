import { useEffect } from "react";

// Lightweight inline toast used instead of alert().
// Usage:
//   const [toast, setToast] = useState(null);
//   setToast({ message: "Exam updated.", type: "success" }); // or type: "error"
//   <Toast toast={toast} onDone={() => setToast(null)} />
function Toast({ toast, onDone }) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(onDone, 2800);
        return () => clearTimeout(timer);
    }, [toast, onDone]);

    if (!toast) return null;

    return (
        <div className={`toast toast-${toast.type || "success"}`} role="status">
            {toast.message}
        </div>
    );
}

export default Toast;