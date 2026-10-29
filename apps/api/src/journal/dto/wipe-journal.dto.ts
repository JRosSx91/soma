import { Equals } from "class-validator";

export class WipeJournalDto {
  @Equals("delete-journal")
  confirm!: "delete-journal";
}
