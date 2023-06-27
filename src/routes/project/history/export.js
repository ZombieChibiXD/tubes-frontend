/**
 * @typedef {{
 *   	Time: any;
 *   	['Tool Material']: any;
 *   	['Tool Code']: any;
 *   	['Toolbox ID']: any;
 *   	['Tool ID']: any;
 *   	['Workpiece Material']: any;
 *   	['Product ID']: any;
 *   	['Initial Diameter (mm)']: any;
 *   	['Final Diameter (mm)']: any;
 *   	['Workpart Length (mm)']: any;
 *   	['Machining Process']: any;
 *   	['Cutting Speed (m/min)']: any;
 *   	['Depth of Cut (mm)']: any;
 *   	['Feeding (mm/rev)']: any;
 *   	['Machining Time (min)']: any;
 *   	['Product Quantity (pcs)']: any;
 *   	['Current Tool Life (min)']: any;
 *   	['Remaining Tool Life (min)']: any;
 * }} ToolHistoryJSON
 */

/**
 * @typedef {import("$lib/types/global").ToolItem & {
 *     tool_color_code: import("$lib/types/global").ToolColorCode,
 *     tool_product_toolbox: import("$lib/types/global").ToolProductToolbox & {
 *         tool_product: import("$lib/types/global").ToolProduct & {
 *           material: import("$lib/types/global").ToolMaterial
 *         }
 *     },
 *     machining_projects: (import("$lib/types/global").MachiningProject & {
 *        machining_project_works: import("$lib/types/global").MachiningProjectWork[]
 *     })[]
 * }} ToolHistory
 */

/**
 * @param {ToolHistory} params
 * @returns {ToolHistoryJSON[]}
 **/
export function convert_to_flat_json(params) {
	const {
		tool_color_code: { code: color_code },
		tool_color_code_id,
		tool_product_toolbox: {
			code: toolbox_code,
			tool_product: {
				code: product_code,
				prefix,
				material: { name: tool_material }
			}
		},
		machining_projects
	} = params;

	/**
	 * @type {ToolHistoryJSON[]}
	 */
	let tool_histories = [];

	machining_projects.forEach(
		({
			workpiece_material,
			cutting_speed,
			depth_of_cut,
			early_tool_life,
			feeding,
			machining_process,
			machining_project_works
		}) => {
			let remaining_time = early_tool_life;
			tool_histories = tool_histories.concat(
				...machining_project_works.map(
					({
						updated_at,
						product_id,
						initial_diameter,
						final_diameter,
						workpart_length,
						machining_time,
						product_quantity,
						total_machining_time
					}) => {
						const current_time = remaining_time;
						remaining_time -= total_machining_time;
						return {
							Time: updated_at,
							'Tool Material': tool_material,
							'Tool Code': product_code,
							'Toolbox ID': `${prefix}-${toolbox_code}`,
							'Tool ID': `${color_code}${tool_color_code_id}`,
							'Workpiece Material': workpiece_material,
							'Product ID': product_id,
							'Initial Diameter (mm)': initial_diameter,
							'Final Diameter (mm)': final_diameter,
							'Workpart Length (mm)': workpart_length,
							'Machining Process': machining_process,
							'Cutting Speed (m/min)': cutting_speed,
							'Depth of Cut (mm)': depth_of_cut,
							'Feeding (mm/rev)': feeding,
							'Machining Time (min)': machining_time,
							'Product Quantity (pcs)': product_quantity,
							'Current Tool Life (min)': current_time,
							'Remaining Tool Life (min)': remaining_time
						};
					}
				)
			);
		}
	);
	if (tool_histories.length === 0) {
		return [
			{
				Time: '',
				'Tool Material': '',
				'Tool Code': '',
				'Toolbox ID': '',
				'Tool ID': '',
				'Workpiece Material': '',
				'Product ID': '',
				'Initial Diameter (mm)': '',
				'Final Diameter (mm)': '',
				'Workpart Length (mm)': '',
				'Machining Process': '',
				'Cutting Speed (m/min)': '',
				'Depth of Cut (mm)': '',
				'Feeding (mm/rev)': '',
				'Machining Time (min)': '',
				'Product Quantity (pcs)': '',
				'Current Tool Life (min)': '',
				'Remaining Tool Life (min)': ''
			}
		]
	}

	return tool_histories;
}

/**
 * @param {{ [ key:string ] : any}} json
 * @returns {string}
 * */
export function to_csv(json) {
	const items = json;
	// @ts-ignore
	const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
	const header = Object.keys(items[0]);
	const csv = [
		header.join(','), // header row first
		...items.map((/** @type {{ [x: string]: any; }} */ row) =>
			// @ts-ignore
			header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
		)
	].join('\r\n');
	return csv;
}
