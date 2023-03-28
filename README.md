# @allen/rehype-image-process

A [rehype](https://rehype.js.org/) plugin for processing image nodes to add blur effect and
width/height in compile time

For now, _Some properties are specific to nextjs_

The idea behind this plugin: https://ironeko.com/posts/how-to-blurred-images-on-load-in-next-js

## Installation

**Not available yet**

```sh
npm install @allen/rehype-image-process
```

## Options

- `srcAsAlt`<br />
  If there no alt exists, insert the transformed src to the alt<br/>
  default: `true`
- `blurDataURLPropertyName`<br />
  The property name of the generated blur image base64 data<br/>
  default: `blurDataURL`
- `placeholderPropertyName`<br />
  The property name of the placeholder (_for nextjs only_)<br/>
  default: `blur`
- `srcTransform(src per image)`<br />
  Convert src of image before it is inserted to any
  framework<br/>
  default: `(src) => src`

## Usage

### Source

```ts
const rehypeImageProcess = require('@allen/rehype-image-process');

rehype().use(rehypeImageProcess).process(`
![some alt](/cat.jpg)

dog.jpg
`);
```

### Yields

```html
<img
  src="/cat.jpg"
  alt="some alt"
  width="500"
  height="500"
  sizes="(max-width: 500px) 100vw, 500px"
  blurDataURL="catblurbase64"
  placeholder="blur"
/>

<img
  src="/dog.jpg"
  alt="/dog.jpg"
  width="200"
  height="300"
  sizes="(max-width: 200px) 100vw, 300px"
  blurDataURL="dogblurbase64"
  placeholder="blur"
/>
```

### License

[MIT](LICENSE.md) @ [Allen Lee](https://github.com/cangSDARM)
