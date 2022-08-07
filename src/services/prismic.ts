import * as prismic from "@prismicio/client";

const repositoryName = process.env.PRISMIC_ENDPOINT;

export function getPrismicClient() {
  return prismic.createClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });
}