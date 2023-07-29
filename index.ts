import { getPlaiceholder } from 'plaiceholder';
import { Node as UnistNode } from 'unist-util-visit/lib';
import { visit } from 'unist-util-visit';

type Node = UnistNode & { value: any; children?: Node[] };
type RehypeNode = Node & {
  tagName?: string;
  properties: Record<string, any>;
};

const DefaultOptions = {
  srcAsAlt: true,
  blurDataURLPropertyName: 'blurDataURL',
  placeholderPropertyName: 'placeholder',
  srcTransform: (src: string) => src,
} as const;

export type RehypeImageProcessOption = Partial<typeof DefaultOptions>;

// TODO: support possible images in mdxElement
function isImageNode(node: RehypeNode) {
  const img = node;

  return (
    img.type === 'element' &&
    img.tagName === 'img' &&
    img.properties &&
    typeof img.properties.src === 'string'
  );
}

function rehypeImageProcess(options: RehypeImageProcessOption) {
  options = Object.assign({}, DefaultOptions, options);

  // Returns the props of given `src` to use for blurred images
  async function returnProps(src: string) {
    const { base64: blurDataURL, img } = await getPlaiceholder(src);

    const { width, height } = img;

    return {
      ...img,
      width,
      height,
      blurDataURL,
    };
  }

  async function addProps(node: RehypeNode, options: RehypeImageProcessOption) {
    const transformedSrc: string = options.srcTransform?.(node.properties.src) || node.properties.src;

    try {
      if (!node.properties) {
        node.properties = {};
        return;
      }

      // return the new props we'll need for our image
      const { width, height, blurDataURL } = await returnProps(transformedSrc);

      // add the props in the properties object of the node
      // the properties object later gets transformed as props
      node.properties.width = width;
      node.properties.height = height;
      node.properties.src = transformedSrc;
      node.properties.sizes = `(max-width: ${width}px) 100vw, ${height}px`;
      if (options.srcAsAlt) {
        node.properties.alt ||= transformedSrc;
      }
      node.properties[options.blurDataURLPropertyName || 'blurDataURL'] = blurDataURL;
      node.properties[options.placeholderPropertyName || 'placeholder'] = 'blur';
    } catch (e) {
      // @ts-ignore
      throw Error(`Invalid image with src: "${transformedSrc}"`, {
        cause: e,
      });
    }
  }

  return async (root: RehypeNode) => {
    // Create an array to hold all of the images from the markdown file
    const images: RehypeNode[] = [];

    visit<any>(root, (node: RehypeNode, i, p) => {
      if (isImageNode(node)) {
        images.push(node);
      }
    });

    for (const image of images) {
      // Loop through all of the images and add their props
      await addProps(image, options);
    }

    return root;
  };
}

export default rehypeImageProcess;
