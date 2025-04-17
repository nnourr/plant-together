import { Button, ButtonSize } from "./button.component";


interface ConfirmModalProps {
  onClose: (arg: string) => void;
  document: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    onClose,
    document
}:ConfirmModalProps) => {

    return (
        <div className="fixed inset-0  backdrop-blur-xs flex items-center justify-center z-9999 transition-opacity duration-200">
            <div className="bg-slate-800 p-6 rounded-xl w-[32rem] shadow-xl">
                <div className="items-center justify-between mb-6 space-y-2">
                    <h2 className="text-white text-2xl font-bold">Delete {document}?</h2>
                    <h3 className="text-white text-xl font-bold">Are you sure you want to delete this document?</h3>

                </div>
                <div className="text-center space-y-2 space-x-40 max-h-[60vh]">
                    <Button
                        size={ButtonSize.lg}
                        onClick={() => {
                            onClose("No")
                        }}
                    >
                        No
                    </Button>
                    <Button
                        size={ButtonSize.lg}
                        onClick={() => {
                            onClose("Yes");
                        }}
                    >
                        Yes
                    </Button>
                </div>
            </div>
        </div>
    )
}