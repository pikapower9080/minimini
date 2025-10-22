import Modal from "react-responsive-modal";
import { Calendar } from "rsuite";

export function Archive({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
	return <Modal open={open} onClose={() => setOpen(false)} classNames={{modal: "archive-modal"}} center showCloseIcon={false}>
		<h2>Archive</h2>
		<h4>Play past puzzles</h4>
		<Calendar compact />
	</Modal>
}