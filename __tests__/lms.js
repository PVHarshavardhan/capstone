const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
const cheerio = require("cheerio");
let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("LMS test suite", () => {
    beforeAll(async () => {
      await db.sequelize.sync({ force: true });
      server = app.listen(4000, () => {});
      agent = request.agent(server);
    });
    afterAll(async () => {
      await db.sequelize.close();
      server.close();
    });
  
    test("signup", async () => {
      const res = await agent.get("/signup");
      const csrfToken = extractCsrfToken(res);
      const pes = await agent.post("/users").send({
        firstName: "1",
        lastName: "1",
        role:"Educator",
        email: "1@gmail.com",
        password: "1",
        _csrf: csrfToken,
      });
      expect(pes.statusCode).toBe(302);
    });

    test("sign out", async () => {
      let res = await agent.get("/home");
      expect(res.statusCode).toBe(200);
      res = await agent.get("/signout");
      expect(res.statusCode).toBe(302);
      res = await agent.get("/home");
      expect(res.statusCode).toBe(302);
    });


});
  