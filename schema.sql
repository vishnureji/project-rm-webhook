DROP TABLE IF EXISTS articles_with_authors;

CREATE TABLE articles_with_authors (
    id            SERIAL    PRIMARY KEY,
    post_id       BIGINT    NOT NULL,
    headline      TEXT,
    post_url      TEXT,
    created_ts    BIGINT,
    updated_ts    BIGINT,
    author_id     BIGINT,
    displayname   TEXT,
    photo         TEXT,
    profile_url   TEXT,
    last_modified TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_post_author UNIQUE (post_id, author_id)
);

CREATE INDEX IF NOT EXISTS idx_awa_post_id   ON articles_with_authors(post_id);
CREATE INDEX IF NOT EXISTS idx_awa_author_id ON articles_with_authors(author_id);