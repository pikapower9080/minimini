import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";

export function getDefaultAvatar(username: string): string {
	const avatar = createAvatar(thumbs, {
		seed: username,
		backgroundColor: ["0a5b83"],
		shapeColor: ["1c799f"],
	});
	
	return avatar.toDataUri();
}