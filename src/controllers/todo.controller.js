import { isValidObjectId } from "mongoose";
import { Todo } from "../models/todo.model.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";
import { errorHandler } from "../middlewares/error.middleware.js";

/**
 * TODO: Create a new todo
 * - Extract data from req.body
 * - Create todo in database
 * - Return 201 with created todo
 */
export async function createTodo(req, res, next) {
  try {
    // Your code here
    const { title, description, completed, priority, tags, dueDate } = req.body;

    const todo = await Todo.create({
      title: title?.trim(),
      description,
      completed,
      priority,
      tags,
      dueDate,
    });

    return res.status(201).json(todo);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: { message: error.message } });
    }
    next(error);
  }
}

/**
 * TODO: List todos with pagination and filters
 * - Support query params: page, limit, completed, priority, search
 * - Default: page=1, limit=10
 * - Return: { data: [...], meta: { total, page, limit, pages } }
 */
export async function listTodos(req, res, next) {
  try {
    // Your code here
    const { page = 1, limit = 10, completed, priority, search } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (completed !== undefined) {
      filter.completed = completed === "true";
    }
    if (priority) {
      filter.priority = priority;
    }
    // can use regex: small apps, text: prod, and match: pipeline
    if (search?.trim()) {
      filter.title = { $regex: search, $options: "i" };
    }

    const todos = await Todo.find(filter)
      .skip(offset)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const total = await Todo.countDocuments(filter);

    return res.status(200).json({
      data: todos,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });

    // const { page = 1, limit = 10, completed, priority, search } = req.query;

    // const pageNumber = Math.max(1, parseInt(page) || 1);
    // const limitNumber = Math.max(1, parseInt(limit) || 10);
    // const offset = (pageNumber - 1) * limitNumber;

    // const filter = {};

    // if (completed !== undefined) {
    //   filter.completed = completed === "true";
    // }

    // if (priority) {
    //   filter.priority = priority;
    // }

    // if (search?.trim()) {
    //   const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    //   filter.title = { $regex: escaped, $options: "i" };
    // }

    // const [todos, total] = await Promise.all([
    //   Todo.find(filter).skip(offset).limit(limitNumber).sort({ createdAt: -1 }),
    //   Todo.countDocuments(filter),
    // ]);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Get single todo by ID
 * - Return 404 if not found
 */
export async function getTodo(req, res, next) {
  try {
    // Your code here
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid id" } });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }

    return res.status(200).json(todo);
  } catch (error) {
    next(error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: { message: "Invalid id" } });
    }
  }
}

/**
 * TODO: Update todo by ID
 * - Use findByIdAndUpdate with { new: true, runValidators: true }
 * - Return 404 if not found
 */
export async function updateTodo(req, res, next) {
  try {
    // Your code here

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid id" } });
    }

    const { title, description, completed, priority } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title?.trim();
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;

    const todo = await Todo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!todo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }

    return res.status(200).json(todo);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: { message: error.message } });
    }
    next(error);
  }
}

/**
 * TODO: Toggle completed status
 * - Find todo, flip completed, save
 * - Return 404 if not found
 */
export async function toggleTodo(req, res, next) {
  try {
    // Your code here
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid id" } });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }

    todo.completed = !todo.completed;
    await todo.save();

    return res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Delete todo by ID
 * - Return 204 (no content) on success
 * - Return 404 if not found
 */
export async function deleteTodo(req, res, next) {
  try {
    // Your code here
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid id" } });
    }
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ error: { message: "Todo not found" } });
    }

    return res.status(204).json({});
  } catch (error) {
    next(error);
  }
}
