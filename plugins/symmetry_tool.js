(function() {

	let symmetry_tool;
	
	Plugin.register('symmetry_tool', {
		title: 'X-Axis Texture-Symmetrizer',
		author: 'Tjured',
		icon: 'icon-mirror_x',
		author: 'Tjured',
		description: 'Make texture symmetrical on local x-axis',
		version: '0.1',
		variant: 'both',
		onload() {
			symmetry_tool = new Tool({
				id: 'symmetry_tool',
				name: 'X-Axis Texture-Symmetrizer',
				icon: 'icon-mirror_x',
				transformerMode: 'hidden',
				category: 'paint',
				alt_tool: 'move_tool',
				modes: ['paint'],
				cursor: 'crosshair',
				onCanvasClick: function(data) {		
					if (data.cube) {
						if ((data.cube.to[0] - data.cube.from[0]) % 2 === 0) {
							symmetrize_with_blockuv(data);
						} else {
							Blockbench.showQuickMessage('Size X must be even')
						}
					}
				}
			});
			Toolbox.add(symmetry_tool);
		},
		onunload() {
			symmetry_tool.delete();
		}
    })
    
    function symmetrize_with_blockuv(data) {
		let texture = data.cube.faces[data.face].getTexture();

		Undo.initEdit({ textures: [texture], bitmap: true });
	
		let resolution_factor = texture.height/Project.texture_height

		let north_uv = Cube.selected[0].faces['north'].uv.map(function(x) { return x * resolution_factor; });
		let south_uv = Cube.selected[0].faces['south'].uv.map(function(x) { return x * resolution_factor; });
		let up_uv = Cube.selected[0].faces['up'].uv.map(function(x) { return x * resolution_factor; });
		let down_uv = Cube.selected[0].faces['down'].uv.map(function(x) { return x * resolution_factor; });
		let east_uv = Cube.selected[0].faces['east'].uv.map(function(x) { return x * resolution_factor; });
		let west_uv = Cube.selected[0].faces['west'].uv.map(function(x) { return x * resolution_factor; });
	
		texture.edit(function (canvas) {
			let ctx = canvas.getContext('2d');
	
			symmetrize_north_face(ctx);
			symmetrize_up_face(ctx);
			symmetrize_down_face(ctx);
			symmetrize_south_face(ctx);
			symmetrize_west_to_east_face(ctx);
	
		}, { method: 'canvas', no_undo: true, use_cache: true, no_update: false });
		Undo.finishEdit('symmetry_tool');
	
		function symmetrize_west_to_east_face(ctx) {
			let img_data = ctx.getImageData(west_uv[0], west_uv[1], west_uv[2] - west_uv[0], west_uv[3] - west_uv[1]);
			const tex_w = west_uv[2] - west_uv[0];
			const tex_h = west_uv[3] - west_uv[1];
			flipImageData(img_data, tex_h, tex_w);
			ctx.putImageData(img_data, east_uv[0], east_uv[1]);
		}
	
		function symmetrize_south_face(ctx) {
			let img_data = ctx.getImageData(south_uv[0], south_uv[1], (south_uv[2] - south_uv[0]) / 2, south_uv[3] - south_uv[1]);
			const tex_w = (south_uv[2] - south_uv[0]) / 2;
			const tex_h = south_uv[3] - south_uv[1];
			flipImageData(img_data, tex_h, tex_w);
			ctx.putImageData(img_data, south_uv[0] + (south_uv[2] - south_uv[0]) / 2, south_uv[1]);
		}
	
		function symmetrize_down_face(ctx) {
			if ((down_uv[0] > down_uv[2]) || (down_uv[1] > down_uv[3])) {
				let img_data = ctx.getImageData(down_uv[2] + (down_uv[0] - down_uv[2]) / 2, down_uv[1], (down_uv[0] - down_uv[2]) / 2, down_uv[3] - down_uv[1]);
				const tex_w = (down_uv[0] - down_uv[2]) / 2;
				const tex_h = down_uv[3];
				flipImageData(img_data, tex_h, tex_w);
				ctx.putImageData(img_data, down_uv[2], down_uv[1]);
			}
			else {
				let img_data = ctx.getImageData(down_uv[0], down_uv[1], (down_uv[2] - down_uv[0]) / 2, down_uv[3] - down_uv[1]);
				const tex_w = (down_uv[2] - down_uv[0]) / 2;
				const tex_h = down_uv[3] - down_uv[1];
				flipImageData(img_data, tex_h, tex_w);
				ctx.putImageData(img_data, (down_uv[0] + down_uv[2]) / 2, down_uv[1]);
			}
		}
	
		function symmetrize_up_face(ctx) {
			if ((up_uv[0] > up_uv[2]) || (up_uv[1] > up_uv[3])) {
				let img_data = ctx.getImageData(up_uv[2] + (up_uv[0] - up_uv[2]) / 2, up_uv[3], (up_uv[0] - up_uv[2]) / 2, up_uv[1] - up_uv[3]);
				const tex_w = (up_uv[0] - up_uv[2]) / 2;
				const tex_h = up_uv[1] - up_uv[3];
				flipImageData(img_data, tex_h, tex_w);
				ctx.putImageData(img_data, up_uv[2], up_uv[3]);
			}
			else {
				let img_data = ctx.getImageData(up_uv[0], up_uv[1], (up_uv[2] - up_uv[0]) / 2, up_uv[3] - up_uv[1]);
				const tex_w = (up_uv[2] - up_uv[0]) / 2;
				const tex_h = up_uv[3] - up_uv[1];
				flipImageData(img_data, tex_h, tex_w);
				ctx.putImageData(img_data, (up_uv[0] + up_uv[2]) / 2, up_uv[1]);
			}
		}
	
		function symmetrize_north_face(ctx) {
			let img_data = ctx.getImageData((north_uv[0] + north_uv[2]) / 2, north_uv[1], (north_uv[2] - north_uv[0]) / 2, north_uv[3] - north_uv[1]);
			const tex_w = (north_uv[2] - north_uv[0]) / 2;
			const tex_h = north_uv[3] - north_uv[1];
			flipImageData(img_data, tex_h, tex_w);
			ctx.putImageData(img_data, north_uv[0], north_uv[1]);
		}
	
		function flipImageData(img_data, tex_h, tex_w) {
			let data_copy = img_data.data.slice();
		
			for (idy = 0; idy < tex_h; idy += 1) {
				for (idx = 0; idx < tex_w * 4; idx += 4) {
					for (pos = 0; pos < 4; pos += 1) {
						img_data.data[idy * tex_w * 4 + (idx + pos)] = data_copy[idy * tex_w * 4 + (tex_w * 4 - idx - 4 + pos)];
					}
				}
			}
		}
	}
})()