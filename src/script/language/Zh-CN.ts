import textLike from './interface';

const Zh_CN : textLike = {
	menu : [
		'人机模式',
		'联机模式',
		'编辑卡组',
		'系统设置',
		'退出游戏'
	],
	dialog : {
		confirm : '确认',
		cancel : '取消'
	},
	deck : {
		main : '主卡组',
		extra : '额外卡组',
		side : '副卡组',
		new : '新建卡组',
		from_url : '从url导入',
		from_code : '从卡组码导入',
		name : '卡组名称',
		info : 'Tauri-YGO',
		exit : '确认要退出吗？',
		remove : '删除卡片 {:?}？',
		search : {
			name : '卡片搜索',
			link : '连接标记',
			type : '类型',
			category : '效果分类',
			race : '种族',
			ot : 'O/T',
			attribute : '属性',
			atk : '攻击力',
			def : '守备力',
			level : '等级/阶级/连接数',
			scale : '灵摆刻度',
			forbidden : '禁限',
			lflist : '禁卡表'
		},
		lflist : {
			forbidden : '禁止',
			limit : '限制',
			semi_limit : '准限制',
			unlimit : '无限制'
		},
		delete : {
			title : '确定要删除卡组吗',
			message : '[{:?}]将会永久消失！（真的很久！）'
		}
	},
	rule : {
		search : '搜索词不合规',
		name : {
			exist : '卡组已存在',
			unlawful : '文件名非法',
			length : '文件名不可为空'
		},
		atk : {
			unlawful : '只允许包含数字和?'
		},
		level : {
			unlawful : '只允许包含数字'
		},
		deck : {
			deck_count : '卡组已达最大数量 {:?}',
			card_count : '卡片已达最大数量 {:?}',
		}
	},
	setting : {
		setting_items : new Map([
			['delete_ypk', '删除补丁时询问'],
			['delete', '删除卡片时询问'],
			['exit', '退出卡组时询问'],
			['button', '确认按钮至于左侧'],
			['back_sound', '背景音量'],
			['button_sound', '按钮音量'],
		]),
		delete : '确认要删除吗？',
		ex_cards : '拓展卡包',
		system_setting : '系统设置',
		reload : '重新加载卡片',
		resert : '重置卡片资源',
		download : {
			url : '下载自定义卡包',
			super_pre : '下载先行卡',
			ex : '下载卡片补丁',
			name : '补丁文件名称（选填）'
		}
	},
	toast : {
		save : '保存成功',
		delete : '删除成功',
		copy : '已复制到粘贴板',
		error : {
			ydk : {
				from_url : '从url转换到卡组失败',
				from_code : '从卡组码转换到卡组失败'
			},
			setting : {
				download : 'url不可为空'
			}
		},
		download : {
			start : '开始下载',
			complete : '下载完成'
		}
	}
}

export default Zh_CN;