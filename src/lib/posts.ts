import deepmerge from "deepmerge";
import fs from "fs";
import matter, { GrayMatterFile } from "gray-matter";
import { bundleMDX } from 'mdx-bundler';
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import path from "path";
import rehypeKatex from 'rehype-katex';
import rehypeMathJax from "rehype-mathjax";
import { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkPrism from "remark-prism";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.mdx?$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as { date: string; title: string }),
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.mdx?$/, ""),
      },
    };
  });
}

interface Settings {
  [key: string]: unknown
}

async function processMdx(
  matter: GrayMatterFile<string>
): Promise<string | MDXRemoteSerializeResult> {
  if (matter.data['variant'] === 'bundler') {
    if(process.platform === "win32"){
      process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), 'node_modules', 'esbuild', 'esbuild.exe')
    }else{
      process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), 'node_modules', 'esbuild', 'bin', 'esbuild')
    }
    // const result = String(await compile(matter.content, {
    //   remarkPlugins: [remarkMath, remarkPrism],
    //   rehypePlugins: [rehypeMathJax]
    // }))
    const result = (await bundleMDX(matter.orig as string, {
      xdmOptions: (options) => {
        // @ts-ignore
        options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkPrism, remarkMath]
        options.rehypePlugins = [...(options.rehypePlugins ?? []), rehypeKatex]
        return options
      }
    }))
    //console.log(`\n\n---\n${result.code}\n---\n\n`)
    return result.code
  }
  const mdxSource = await serialize(matter.content, {
    mdxOptions: {
      // @ts-ignore
      remarkPlugins: [remarkPrism, remarkMath],
      rehypePlugins: [rehypeMathJax],
    },
  });
  return mdxSource;
}

async function processMarkdown(
  matter: GrayMatterFile<string>
): Promise<string> {
  const schema = deepmerge(defaultSchema, { tagNames: ["math", "mi"] });

  // Use remark to convert markdown into HTML string
  const processedContent = await unified()
    .use(remarkParse)
    // @ts-ignore
    .use(remarkPrism, {
      /* options */
    })
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeMathJax)
    //.use(rehypeSanitize)
    .use(rehypeStringify)
    .process(matter.content);
  return processedContent.toString();
}

export async function getPostData(id: string) {
  var type = "mdx";
  var fullPath = path.join(postsDirectory, `${id}.mdx`);
  if (!fs.existsSync(fullPath)) {
    type = "md";
    fullPath = path.join(postsDirectory, `${id}.md`);
  }
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  var content: string | MDXRemoteSerializeResult;
  if (type === "mdx") {
    content = await processMdx(matterResult);
  } else {
    content = await processMarkdown(matterResult);
  }

  // Combine the data with the id and content
  return {
    id,
    content: content,
    ...(matterResult.data as { date: string; title: string, variant?: string }),
  };
}
