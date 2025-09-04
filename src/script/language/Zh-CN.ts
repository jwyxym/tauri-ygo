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
		},
		rule : {
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
			}
			
		}
	},
	toast : {
		deck_list : {
			copy : '已复制到粘贴板',
			delete : '删除成功'
		},
		error : {
			search : '搜索词不合规',
			ydk : {
				from_url : '从url转换到卡组失败',
				from_code : '从卡组码转换到卡组失败'
			}
		},
		deck : {
			save : '保存成功'
		}
	}
}

export default Zh_CN;