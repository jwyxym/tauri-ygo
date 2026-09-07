<h1>对于自定义脚本</h1>
<p>
脚本必须放在游戏根目录的plugin文件夹下
<br/>
必须具有一个入口函数
</p>

```javascript
function main () {}
//或者
async function main () {}
```
<h3>关于入口函数的描述</h3>
<table>
	<tr>
		<th>脚本</th>
		<th>文件名</th>
		<th>参数数量</th>
		<th>参数类型</th>
		<th>参数描述</th>
		<th>返回值类型</th>
		<th>返回描述</th>
	</tr>
	<tr>
		<td>DGLAB 自定义脚本</td>
		<td>dglab.js</td>
		<td>2</td>
		<td>number,<br/>string[]</td>
		<td>失去的基本分,<br/>
			<a target = '_blank' href = 'https://github.com/dungeonlab-open/dglab-kit/blob/main/src/waveform/ovc.ts'>默认波形列表</a>
		</td>
		<td>[number,<br/>number,<br/>string[] | number]</td>
		<td>[强度(0-200),<br/>时间(秒),<br/>自定义波形/下标(选填)]</td>
	</tr>
</table>

<h3>YGOPro3 JS API</h3>
<span>你可以在js脚本中调用全局对象YGOPro3的方法</span>

```javascript
try {
	await YGOPro3.log('hello world')
	const text = await YGOPro3.get('https://example.com')
	const result = await YGOPro3.post('https://example.com/api', JSON.stringify({
		name: 'YGOPro3'
	}))
} catch (e) {
	// ......
}
```

<table>
	<tr>
		<th>方法</th>
		<th>默认启用</th>
		<th>方法解释</th>
		<th>参数数量</th>
		<th>参数类型</th>
		<th>返回值</th>
	</tr>
	<tr>
		<td>log</td>
		<td>是</td>
		<td>在error.log写入文本，非成功状态会抛出异常</td>
		<th>1</th>
		<th>string</th>
		<th>Promise&lt;void&gt;</th>
	</tr>
	<tr>
		<td>get</td>
		<td>否</td>
		<td>发送GET请求，返回响应文本，非成功状态会抛出异常</td>
		<th>1</th>
		<th>string</th>
		<th>Promise&lt;string&gt;</th>
	</tr>
	<tr>
		<td>post</td>
		<td>否</td>
		<td>发送POST请求，返回响应文本，非成功状态会抛出异常</td>
		<th>2</th>
		<th>string,<br/>string</th>
		<th>Promise&lt;string&gt;</th>
	</tr>
	<tr>
		<td>put</td>
		<td>否</td>
		<td>发送PUT请求，返回响应文本，非成功状态会抛出异常</td>
		<th>2</th>
		<th>string,<br/>string</th>
		<th>Promise&lt;string&gt;</th>
	</tr>
	<tr>
		<td>patch</td>
		<td>否</td>
		<td>发送PATCH请求，返回响应文本，非成功状态会抛出异常</td>
		<th>2</th>
		<th>string,<br/>string</th>
		<th>Promise&lt;string&gt;</th>
	</tr>
	<tr>
		<td>delete</td>
		<td>否</td>
		<td>发送DELETE请求，返回响应文本，非成功状态会抛出异常</td>
		<th>1</th>
		<th>string</th>
		<th>Promise&lt;string&gt;</th>
	</tr>
	<tr>
		<td>head</td>
		<td>否</td>
		<td>发送HEAD请求，返回响应文本，非成功状态会抛出异常</td>
		<th>1</th>
		<th>string</th>
		<th>Promise&lt;string&gt;</th>
	</tr>
	<tr>
		<td>options</td>
		<td>否</td>
		<td>发送OPTIONS请求，返回响应文本，非成功状态会抛出异常</td>
		<th>1</th>
		<th>string</th>
		<th>Promise&lt;string&gt;</th>
	</tr>
</table>
