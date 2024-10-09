DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('MEMBER', 'LIBRARIAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE book_status AS ENUM ('AVAILABLE', 'BORROWED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password text NOT NULL,
    email text NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'MEMBER',
    deleted boolean NOT NULL DEFAULT false,
    deleted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_username ON users (username);
CREATE INDEX IF NOT EXISTS users_email ON users (email);
CREATE INDEX IF NOT EXISTS users_created_at ON users (created_at);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    refresh_token text NOT NULL,
    user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    device text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_refresh_token ON refresh_tokens (refresh_token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS refres_tokens_refresh_token_user_id ON refresh_tokens (refresh_token, user_id);

CREATE TABLE IF NOT EXISTS books (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    author text NOT NULL,
    status book_status NOT NULL DEFAULT 'AVAILABLE',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_title ON books (title);
CREATE INDEX IF NOT EXISTS books_author ON books (author);
CREATE INDEX IF NOT EXISTS books_id_status ON books (id, status);
CREATE INDEX IF NOT EXISTS books_created_at ON books (created_at);

CREATE TABLE IF NOT EXISTS borrows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users (id),
    book_id uuid REFERENCES books (id) ON DELETE SET NULL,
    borrowed_at timestamptz NOT NULL DEFAULT now(),
    returned_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS borrows_user_id ON borrows (user_id);
CREATE INDEX IF NOT EXISTS borrows_book_id ON borrows (book_id);
CREATE INDEX IF NOT EXISTS borrows_created_at ON borrows (created_at);
CREATE INDEX IF NOT EXISTS borrows_user_id_book_id ON borrows (user_id, book_id);

-- Triggers to update updated_at field
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_updated_at();

CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE PROCEDURE trigger_updated_at();

CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON borrows
FOR EACH ROW
EXECUTE PROCEDURE trigger_updated_at();
