import textLike from './interface';

const Zh_CN : textLike = {
	menu : [
		'人机模式',
		'联机模式',
		'编辑卡组',
		'系统设置',
		'退出游戏'
	],
	deck : {
		new : '新建卡组',
		fromurl : '从url导入',
		fromcode : '从卡组码导入',
		name : '卡组名称',
		info : '欢迎使用tauri-ygo',
		search : {
			name : '卡片搜索'
		},
		delete : {
			title : '确定要删除卡组吗',
			message : '[{:?}]将会永久消失！（真的很久！）'
		},
		name_rule : {
			exist : '卡组已存在',
			unlawful : '文件名非法'
		}
	},
	toast : {
		copy : '已复制到粘贴板',
		delete : '删除成功'
	}
}

export default Zh_CN;