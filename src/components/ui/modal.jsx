export function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            ></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 z-10 max-w-lg w-full">
                {children}
            </div>
        </div>
    );
}
