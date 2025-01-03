import fs from "node:fs/promises";
import { join } from "node:path";
import type { DB } from "./db";

export const seed = async (db: DB) => {
  try {
    const path = join(process.cwd(), "src", "db", "data.json");
    const file = await fs.readFile(path, "utf-8");
    const data = JSON.parse(file);

    const insertType = db.prepare(`
      INSERT INTO types (id, name)
      VALUES (?, ?)
    `);

    data.types.forEach((type: any) => {
      insertType.run(type.id, type.name);
    });

    const insertTemplate = db.prepare(`
      INSERT INTO templates (
        id, name, allowed_days, max_capacity, price,
        is_private, allow_waitlist, allow_same_day, fixed_price, created_at, type_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    data.templates.forEach((template: any) => {
      insertTemplate.run(
        template.id,
        template.name,
        JSON.stringify(template.allowed_days),
        template.max_capacity,
        template.price,
        template.is_private ? 1 : 0,
        template.allow_waitlist ? 1 : 0,
        template.allow_same_day ? 1 : 0,
        template.fixed_price ? 1 : 0,
        template.created_at,
        template.type_id
      );
    });

    const insertEvent = db.prepare(`
      INSERT INTO events (
        id, slug, title, description_short, description_long,
        date, location, type_id, capacity, price,
        template_id, status, is_private, allow_same_day, allow_waitlist, waitlist
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    data.events.forEach((event: any) => {
      insertEvent.run(
        event.id,
        event.slug,
        event.title,
        event.description_short,
        event.description_long,
        event.date,
        event.location,
        event.type_id,
        event.capacity,
        event.price,
        event.template_id,
        event.status,
        event.is_private ? 1 : 0,
        event.allow_same_day ? 1 : 0,
        event.allow_waitlist ? 1 : 0,
        event.waitlist ? JSON.stringify(event.waitlist) : null
      );
    });

    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        id, event_id, name, email, has_paid, status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    data.bookings.forEach((booking: any) => {
      insertBooking.run(
        booking.id,
        booking.event_id,
        booking.name,
        booking.email,
        booking.has_paid ? 1 : 0,
        booking.status
      );
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
