export type Timestamp = {
	created_at: string;
	updated_at: string;
};
export type NewAccessToken = {
	accessToken: {
		name: string;
		abilities: string[];
		expires_at: string;
		tokenable_id: number;
		tokenable_type: string;
		id: number;
	} & Timestamp;
	plainTextToken: string;
};

export type User = {
	id: number;
	name: string;
	email: string;
	username: string;
	email_verified_at: string?;
	role_names: string[];
} & Timestamp;

export type Role = {
	id: number;
	name: string;
} & Timestamp;

export type ToolMaterial = {
	id: number;
	name: string;
	description: string?;
} & Timestamp;
export type ToolProduct = {
	id: number;
	tool_material_id: number;
	code: string;
	prefix: string;
	name: string | null;
	min_cutting_speed: number;
	max_cutting_speed: number;
} & Timestamp;

export type ToolProductToolbox = {
	id: number;
	tool_product_id: number;
	code: number;
} & Timestamp;

export type ToolColorCode = {
	id: number;
	code: string;
	color: string;
	text_color: string;
} & Timestamp;

export type ToolItem = {
	id: number;
	tool_product_toolbox_id: number;
	tool_color_code_id: number;
} & Timestamp;

export type MachiningProject = {
	id: number;
	tool_item_id: number;
	workpiece_material: string;
	machining_process: string;
	cutting_speed: number;
	depth_of_cut: number;
	feeding: number;
	early_tool_life: number;
	remaining_tool_life: number;
	total_machining_time: number;
	is_active: boolean;
} & Timestamp;

export type MachiningData = {
	workpiece_materials: string[];
	machining_processes: string[];
	c: number;
	n: number;
}

export type MachiningProjectWork = {
	id: number;
	machining_project_id: number;
	product_id: string;
	initial_diameter: number;
	final_diameter: number;
	workpart_length: number;
	product_quantity: number;
	machining_time: number;
	total_machining_time: number;
} & Timestamp;

export type ToolMaterialAdvanced = {
	products: ToolProduct[];
	products_count: number;
} & ToolMaterial;

export type ToolProductAdvanced = ToolProduct & {
	toolboxes: ToolProductToolbox[];
	toolbox_count: number;
};

export type MachiningProjectExtended = MachiningProject & {
	tool_item: ToolItem;
	machining_project_works: MachiningProjectWork[];
};

export type ProjectData = {
	materials: (ToolMaterial & (ToolMaterialAdvanced & {
		products: (ToolProductAdvanced & {
			toolboxes: (ToolProductToolbox & {
				tool_items: ToolItem[];
			})[];
		})[];
	}))[];
	projects: MachiningProject[];
	machining: MachiningData;
	colors: {
		[key: number | string]: ToolColorCode;
	}
}