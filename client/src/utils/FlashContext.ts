import { createContext } from "react";

interface Flash {
	message: string | null,
	type: "error" | "success"
}

const FlashContext = createContext<Flash>({
	message: null,
	type: "error" || "success"
});
const { Provider } = FlashContext;

export { Provider, FlashContext };
