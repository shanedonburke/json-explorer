export const SAMPLE_JSON: Readonly<object> = {
	a: {
		b: 0,
		c: [
			1,
			{
				d: 2,
				e: "Hello world"
			}
		],
		f: {
			g: null,
			h: [3, 4, 5]
		},
    "My key": "My value",
    i: true
	}
};

export const INPUT_JSON_STORAGE_KEY = "inputJson";

export const ROOT_NODE_KEY = "Root";