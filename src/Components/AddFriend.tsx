import Modal from "react-responsive-modal";

export default function AddFriend({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return <Modal open={open} onClose={() => setOpen(false)} center showCloseIcon={false}></Modal>;
}
