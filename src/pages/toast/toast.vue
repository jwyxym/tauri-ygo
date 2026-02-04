<template>
	<div class = 'toast'>
		<div
			v-for = '(i, v) in toast.list'
			:class = '`${i.type} ${i.status}`'
			:id = 'i.id'
			:key = 'i.id'
			:style = "{ '--top' : `${i.top}px`, '--time' : `${toast.time}s` }"
			:ref = '($el) => toast.set_elements($el as HTMLDivElement | null, i)'
		>
			{{ i.text }}
			<div class = 'pointer' @click = 'toast.splice(v)'>
				<span>&times;</span>
			</div>
		</div>
	</div>
</template>
<script setup lang = 'ts'>
	import toast from './toast';
</script>
<style scoped lang = 'scss'>
	$info: #2196f3;
	$warn: #ffc107;
	$err: #ff5252;
	.toast {
		color: white;
		position: fixed;
		right: 0;
		top: 50%;
		width: 350px;
		height: calc(var(--height) * 0.9);
		transform: translate(0, -50%) scale(var(--scale));
		user-select: none;
		pointer-events: none;
		z-index: 10;
		> div {
			position: absolute;
			transition: all 0.2s ease;
			top: 0;
			left: 0;
			width: 100%;
			min-height: 70px;
			background: rgba(255, 255, 255, 0.3);
			backdrop-filter: blur(10px);
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
			border-radius: 10px;
			overflow: hidden;
			overflow-wrap: break-word;
			display: flex;
			justify-content: center;
			align-items: center;
			> div:last-child {
				position: absolute;
				right: 0;
				top: 50%;
				transform: translate(-5px, -50%);
				pointer-events: auto;
				&:hover {
					color: rgb(39, 39, 39);
				}
			}
			&::before {
				position: absolute;
				transition: all var(--time) linear;
				content: '';
				width: 100%;
				height: 3px;
				left: 0;
				bottom: 0;
			}
		}
		.show {
			transform: translate(-20px, var(--top));
			&::before {
				width: 0;
			}
		}
		.unshow, .leave {
			transform: translate(var(--width), var(--top));
		}
		.info {
			border: 2px solid rgba($color: $info, $alpha: 0.5);
			&::before {
				background-color: $info;
			}
		}
		.warn {
			border: 2px solid rgba($color: $warn, $alpha: 0.5);
			&::before {
				background-color: $warn;
			}
		}
		.err {
			border: 2px solid rgba($color: $err, $alpha: 0.5);
			&::before {
				background-color: $err;
			}
		}
	}
</style>