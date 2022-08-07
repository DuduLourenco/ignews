import {GetStaticPaths, GetStaticProps} from "next";
import Head from "next/head";

import styles from "../post.module.scss";

import {useSession} from "next-auth/react";
import {getPrismicClient} from "../../../services/prismic";
import {RichText} from "prismic-dom";
import Link from "next/link";
import {useEffect} from "react";
import {useRouter} from "next/router";

interface PostPreviewProps {
  post: {
    slug: string,
    title: string,
    content: string,
    updateAt: string
  }
}

export default function PostPreview({post}: PostPreviewProps) {
  const { data } = useSession();
  const router = useRouter();

  useEffect(() => {
    if(data?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [data])

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.postContainer}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updateAt}</time>

          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{__html: post.content}}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href={"/"}>
              <a>
                Subscribe now 🤗
              </a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking"
  };
}

export const getStaticProps: GetStaticProps = async ({params}) => {
  const {slug} = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID("post", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.Title),
    content: RichText.asHtml(response.data.Content.splice(0, 3)),
    updateAt: new Date(response.last_publication_date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    })
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30, // 30 minutes
  }
}