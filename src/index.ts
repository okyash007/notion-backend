import { Hono } from "hono";
import { cors } from "hono/cors";
import { BaseResponseDTO } from "./utils/DTOs/BaseResponseDTO";
import { Doc } from "./utils/DTOs/Doc";
import { v4 as uuidv4 } from "uuid";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Wong Server Works!");
});

app.get("/doc", async (c) => {
  try {
    let { results } = await c.env.DB.prepare(`SELECT * FROM Documents`).all();
    const res: BaseResponseDTO<Record<string, unknown>[]> = {
      code: 200,
      message: "Successfully fetched Documents",
      data: results,
    };
    return c.json(res);
  } catch (e) {
    return c.json({
      code: 500,
      message: e,
    });
  }
});

app.get("/doc/:id", async (c) => {
  const docId = c.req.param("id");
  console.log(docId);
  try {
    let { results } = await c.env.DB.prepare(
      "SELECT * FROM Documents WHERE id = ?"
    )
      .bind(docId)
      .all();
    const res: BaseResponseDTO<Record<string, unknown>[]> = {
      code: 200,
      message: `Successfully fetched Document ${docId}`,
      data: results,
    };
    return c.json(res);
  } catch (e) {
    return c.json({
      code: 500,
      message: e,
    });
  }
});

app.post("/doc", async (c) => {

  try {
    const doc: Doc = await c.req.json();

    console.log(c.env)

    let newId = uuidv4();
    const { duration } = (
      await c.env.DB.prepare(
        "INSERT INTO Documents (id, title, content) VALUES (?1, ?2, ?3)"
      )
        .bind(newId, doc.title, doc.content)
        .run()
    ).meta;
    console.log(duration)
    let res: BaseResponseDTO<any> = {
      code: 200,
      message: `Document Saved in ${duration} s`,
      data: newId,
    };
    return c.json(res);
  } catch (e) {
    return c.json({
      code: 500,
      message: e,
    });
  }
});

export default app;
