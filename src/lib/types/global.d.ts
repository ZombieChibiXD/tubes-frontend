export interface NewAccessToken {
	accessToken: {
		name: string;
		abilities: string[];
		expires_at: string;
		tokenable_id: number;
		tokenable_type: string;
		updated_at: string;
		created_at: string;
		id: number;
	};
	plainTextToken: string;
}
export interface User {
	id: number;
	name: string;
	email: string;
	username: string;
	email_verified_at: string?;
	created_at: string;
	updated_at: string;
	role_names: string[];
}
export interface ToolMaterial {
	id: number;
	name: string;
    description: string?;
    created_at: string;
    updated_at: string;
    pivot?: ToolProductMaterial;
    products?: ToolProduct[];
}

export interface ToolProduct {
	id: number;
	code: string;
	name: string | null;
	min_cutting_speed: number;
	max_cutting_speed: number;
	created_at: string;
	updated_at: string;
    items?: ToolItem[];
	pivot?:  ToolProductMaterial;
}

export interface ToolProductMaterial {
    id: number;
    tool_product_id: number;
    tool_material_id: number;
    created_at: string;
    updated_at: string;
}

export interface ToolItem {
    id: number;
    tool_product_id: number;
    item_code: number;
    created_at: string;
    updated_at: string;
}

export interface MachiningProject {
	id: number;
	tool_material_id: number;
	tool_product_id: number;
	tool_item_id: number;
	workpiece_material: string;
	machining_process: string;
	cutting_speed: number;
	depth_of_cut: number;
	feeding: number;
	early_tool_life: number;
	remaining_time: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface MachiningProjectWork {
	id: number;
	machining_project_id: number;
	product_id: string;
	initial_diameter: number;
	final_diameter: number;
	workpart_length: number;
	product_quantity: number;
	machining_time: number;
	created_at: string;
	updated_at: string;
}

export interface MachiningProjectExtended extends MachiningProject {
	tool_material: ToolMaterial;
	tool_product: ToolProduct;
	tool_item: ToolItem;
	machining_project_works: MachiningProjectWork[];
}



