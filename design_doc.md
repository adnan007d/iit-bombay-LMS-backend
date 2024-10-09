# Library Management System

## Introduction

This document describes the design of the library management system.

## Requirements

-   User Authentication
    -   JWT Tokens (5 mins) and Refresh Tokens (30 days)
    -   User can be a Library Manager or a Member
-   Operations as Member
    -   View all books
    -   Borrow a book
    -   Return a book
    -   View History of borrowed books
    -   Delete his own account
-   Operations as Library Manager
    -   CRUD books
    -   CRUD member
    -   View history of all members
    -   View Deleted and Active members

## Design

-   When a user is created by a Librarian, the password will be set by the Librarian.
    In production an email should be sent to the user to create a new password.
-   When a access token is expired (not invalid) a new access and refresh token will be generated.
    It's the `clients` responsibility to check the response header `authorization`
    to check and update the access token.
-   When a book is deleted it will be deleted from the database. and borrows history will be
    set to null so there is history of the book.

### Data Model

#### User

| Field      | Type       | Description             |
| ---------- | ---------- | ----------------------- |
| id         | uuid       | Primary Key             |
| username   | string     | Username                |
| password   | string     | Password                |
| email      | string     | Email                   |
| role       | string     | User Role               |
| deleted    | boolean    | Deleted                 |
| deleted_at | timestampz | Datetime of deletion    |
| created_at | timestampz | Datetime of creation    |
| updated_at | timestampz | Datetime of last update |

**Index**: `username`, `email`, `created_at`

#### Book

| Field      | Type       | Description             |
| ---------- | ---------- | ----------------------- |
| id         | uuid       | Primary Key             |
| title      | string     | Book Title              |
| author     | string     | Book Author             |
| status     | string     | AVAILABLE or BORROWED   |
| created_at | timestampz | Datetime of creation    |
| updated_at | timestampz | Datetime of last update |

**Index**: `title`, `author`, `available`, `created_at`

#### Borrow

| Field       | Type       | Description             |
| ----------- | ---------- | ----------------------- |
| id          | uuid       | Primary Key             |
| user_id     | uuid       | User ID                 |
| book_id     | uuid       | Book ID                 |
| borrowed_at | timestampz | Datetime of borrowing   |
| returned_at | timestampz | Datetime of returning   |
| created_at  | timestampz | Datetime of creation    |
| updated_at  | timestampz | Datetime of last update |

**Index**: `user_id`, `book_id`, `created_at`, `borrowed_at`, `returned_at`

#### Triggers

-   Updated at trigger for all tables
