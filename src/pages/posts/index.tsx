import Head from "next/head";
import {GetStaticProps} from "next";
import {RichText} from "prismic-dom";
import Link from "next/link";

import styles from "./styles.module.scss";

import {getPrismicClient} from "../../services/prismic";
import {useSession} from "next-auth/react";

type Post = {
  slug: string,
  title: string,
  excerpt: string,
  updateAt: string
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  const { data } = useSession();

  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map(post => (
              <Link key={post.slug} href={`/posts/${data?.activeSubscription ? "" : "preview/"}${post.slug}`}>
                <a key={post.slug}>
                  <time>{ post.updateAt }</time>
                  <strong>{ post.title }</strong>
                  <p>{ post.excerpt }</p>
                </a>
              </Link>
            ))
          }

        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.getAllByType("post", {
    fetch: ["title", "content"],
    pageSize: 100
  });

  const posts = response.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.Title),
      excerpt: post.data.Content.find(content => content.type === "paragraph" && content.text !== "")?.text ?? "",
      updateAt: new Date(post.last_publication_date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
    }
  });

  return {
    props: {
      posts
    }
  }
}