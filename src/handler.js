const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal ditambahkan",
  });
  response.code = 500;
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (name) {
    const filteredName = books.filter((book) => {
      const regex = new RegExp("name", "i");
      return regex.test(book.name);
    });
    const response = h.response({
      status: "success",
      data: {
        books: filteredName.map(({ id, name, publisher }) => ({
          id,
          name,
          publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  if (reading) {
    let filteredBook;

    if (reading === "1") {
      filteredBook = books.filter((book) => book.reading === true);
    } else if (reading === "0") {
      filteredBook = books.filter((book) => book.reading === false);
    } else {
      filteredBook = books;
    }

    return h
      .response({
        status: "success",
        data: {
          books: filteredBook.map(({ id, name, publisher }) => ({
            id,
            name,
            publisher,
          })),
        },
      })
      .code(200);
  }

  if (reading || finished) {
    const filterKey = reading ? "reading" : "finished";
    const filterValue = reading ? reading : finished;

    let filteredBook;

    if (filterValue === "1") {
      filteredBook = books.filter((book) => book[filterKey] === true);
    } else if (filterValue === "0") {
      filteredBook = books.filter((book) => book[filterKey] === false);
    } else {
      filteredBook = books;
    }

    return h
      .response({
        status: "success",
        data: {
          books: filteredBook.map(({ id, name, publisher }) => ({
            id,
            name,
            publisher,
          })),
        },
      })
      .code(200);
  }

  const response = h.response({
    status: "success",
    data: {
      books: books.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((book) => book.id === bookId)[0];

  if (book) {
    return h
      .response({
        status: "success",
        data: {
          book,
        },
      })
      .code(200);
  }

  return h
    .response({
      status: "fail",
      message: "Buku tidak ditemukan",
    })
    .code(404);
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  const finished = pageCount === readPage;
  const updatedAt = new Date().toISOString();
  const book = books.findIndex((book) => book.id === bookId);

  if (book !== -1) {
    books[book] = {
      ...books[book],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };
    const response = h.response({
      status: "success",
      message: "Buku berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui buku. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.findIndex((book) => book.id === bookId);

  if (book !== -1) {
    books.splice(book, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
