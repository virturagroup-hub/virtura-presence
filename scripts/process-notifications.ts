import { processPendingNotificationEvents } from "@/lib/notification-delivery";

async function main() {
  const requestedLimit = Number(process.env.NOTIFICATION_BATCH_LIMIT ?? "25");
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 25;
  const results = await processPendingNotificationEvents(limit);

  const processed = results.filter((result) => result.status === "processed").length;
  const failed = results.filter((result) => result.status === "failed");

  console.info("Virtura Presence notification processing", {
    limit,
    total: results.length,
    processed,
    failed: failed.length,
  });

  if (failed.length) {
    failed.forEach((result) => {
      console.error("Notification failed", result);
    });

    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
