import { MigrationInterface, QueryRunner } from 'typeorm';

export class createAll1632481293101 implements MigrationInterface {
  name = 'createAll1632481293101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA usr');
    await queryRunner.query('CREATE SCHEMA chnl');
    await queryRunner.query('CREATE SCHEMA cmn');
    await queryRunner.query('CREATE SCHEMA wdgt');

    await queryRunner.query(
      `CREATE TABLE "cmn"."scans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" integer NOT NULL, "object_id" integer NOT NULL, "channel_id" uuid, CONSTRAINT "PK_41156c08314b9e541c1cb18c588" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cmn"."interests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "priority" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a2dc7b6f9a8bcf9e3f9312a879d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usr"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying, "last_name" character varying, "email" character varying, "phone_number" character varying NOT NULL, "location" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "onboarded" boolean NOT NULL DEFAULT false, "role" character varying NOT NULL DEFAULT 'USER', "last_login_at" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wdgt"."promotions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image_url" character varying NOT NULL, "button_text" character varying NOT NULL, "button_color" character varying NOT NULL, "widget_id" uuid, CONSTRAINT "REL_5fe1e6ebb281dfc1dd76527160" UNIQUE ("widget_id"), CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wdgt"."tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wdgt"."story_block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "swipe_url" character varying NOT NULL, "asset_url" character varying NOT NULL, "widget_id" uuid, CONSTRAINT "PK_ad031545d5fb4b6ae0e5bcbed88" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wdgt"."widgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "type" character varying NOT NULL, "parent_id" integer, "title" character varying NOT NULL, "background_color" character varying, "web_view_url" character varying NOT NULL, "exclusive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_da23136dbcfc91424451e24b725" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chnl"."channels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "inscription" character varying NOT NULL, "league" character varying NOT NULL, "league_label" character varying NOT NULL, "inscription_label" character varying NOT NULL DEFAULT 'Wilson', "type_label" character varying NOT NULL, CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usr"."users_interests" ("users_id" uuid NOT NULL, "interests_id" uuid NOT NULL, CONSTRAINT "PK_b7eb8c137d7ffcfc540996a91e9" PRIMARY KEY ("users_id", "interests_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_d49c25558b7a016a8e6675aac8" ON "usr"."users_interests" ("users_id") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_d645bb7af9e9b7a187e7006f10" ON "usr"."users_interests" ("interests_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "usr"."users_promotions" ("users_id" uuid NOT NULL, "promotions_id" uuid NOT NULL, CONSTRAINT "PK_3c518b95d151068458a645e8c79" PRIMARY KEY ("users_id", "promotions_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_8e7b666b275d42b271beb4b05b" ON "usr"."users_promotions" ("users_id") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_75c0ee1d89b096cbc2c8ffccd2" ON "usr"."users_promotions" ("promotions_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "usr"."favorites" ("users_id" uuid NOT NULL, "widgets_id" uuid NOT NULL, CONSTRAINT "PK_6c83b2680d6dc65c4eab582abe6" PRIMARY KEY ("users_id", "widgets_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_116e5accbd837e701845dae638" ON "usr"."favorites" ("users_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_190c6e5996ae16d28ff7971503" ON "usr"."favorites" ("widgets_id") `);
    await queryRunner.query(
      `CREATE TABLE "wdgt"."widget_tags" ("tags_id" uuid NOT NULL, "widgets_id" uuid NOT NULL, CONSTRAINT "PK_c30061d7b881922947ca94f0d18" PRIMARY KEY ("tags_id", "widgets_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_c76431b534f9c9287986232ecd" ON "wdgt"."widget_tags" ("tags_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_72e6fec18e1a2515c835e211ac" ON "wdgt"."widget_tags" ("widgets_id") `);
    await queryRunner.query(
      `CREATE TABLE "chnl"."channels_widgets" ("channels_id" uuid NOT NULL, "widgets_id" uuid NOT NULL, CONSTRAINT "PK_ad6378c87c4cd4f6b37ec241c69" PRIMARY KEY ("channels_id", "widgets_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_105e629c9a0f86968497242ce8" ON "chnl"."channels_widgets" ("channels_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00c2f7a6f580c8ff368cb1b2cb" ON "chnl"."channels_widgets" ("widgets_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "cmn"."scans" ADD CONSTRAINT "FK_286c9c1035ae4966cccd4527a16" FOREIGN KEY ("channel_id") REFERENCES "chnl"."channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wdgt"."promotions" ADD CONSTRAINT "FK_5fe1e6ebb281dfc1dd765271607" FOREIGN KEY ("widget_id") REFERENCES "wdgt"."widgets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wdgt"."story_block" ADD CONSTRAINT "FK_30de5737507381e2550841497d7" FOREIGN KEY ("widget_id") REFERENCES "wdgt"."widgets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usr"."users_interests" ADD CONSTRAINT "FK_d49c25558b7a016a8e6675aac8c" FOREIGN KEY ("users_id") REFERENCES "usr"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "usr"."users_interests" ADD CONSTRAINT "FK_d645bb7af9e9b7a187e7006f10c" FOREIGN KEY ("interests_id") REFERENCES "cmn"."interests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usr"."users_promotions" ADD CONSTRAINT "FK_8e7b666b275d42b271beb4b05b4" FOREIGN KEY ("users_id") REFERENCES "usr"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "usr"."users_promotions" ADD CONSTRAINT "FK_75c0ee1d89b096cbc2c8ffccd2d" FOREIGN KEY ("promotions_id") REFERENCES "wdgt"."promotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usr"."favorites" ADD CONSTRAINT "FK_116e5accbd837e701845dae638f" FOREIGN KEY ("users_id") REFERENCES "usr"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "usr"."favorites" ADD CONSTRAINT "FK_190c6e5996ae16d28ff7971503c" FOREIGN KEY ("widgets_id") REFERENCES "wdgt"."widgets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wdgt"."widget_tags" ADD CONSTRAINT "FK_c76431b534f9c9287986232ecd1" FOREIGN KEY ("tags_id") REFERENCES "wdgt"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wdgt"."widget_tags" ADD CONSTRAINT "FK_72e6fec18e1a2515c835e211acf" FOREIGN KEY ("widgets_id") REFERENCES "wdgt"."widgets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chnl"."channels_widgets" ADD CONSTRAINT "FK_105e629c9a0f86968497242ce80" FOREIGN KEY ("channels_id") REFERENCES "chnl"."channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "chnl"."channels_widgets" ADD CONSTRAINT "FK_00c2f7a6f580c8ff368cb1b2cbc" FOREIGN KEY ("widgets_id") REFERENCES "wdgt"."widgets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chnl"."channels_widgets" DROP CONSTRAINT "FK_00c2f7a6f580c8ff368cb1b2cbc"`);
    await queryRunner.query(`ALTER TABLE "chnl"."channels_widgets" DROP CONSTRAINT "FK_105e629c9a0f86968497242ce80"`);
    await queryRunner.query(`ALTER TABLE "wdgt"."widget_tags" DROP CONSTRAINT "FK_72e6fec18e1a2515c835e211acf"`);
    await queryRunner.query(`ALTER TABLE "wdgt"."widget_tags" DROP CONSTRAINT "FK_c76431b534f9c9287986232ecd1"`);
    await queryRunner.query(`ALTER TABLE "usr"."favorites" DROP CONSTRAINT "FK_190c6e5996ae16d28ff7971503c"`);
    await queryRunner.query(`ALTER TABLE "usr"."favorites" DROP CONSTRAINT "FK_116e5accbd837e701845dae638f"`);
    await queryRunner.query(`ALTER TABLE "usr"."users_promotions" DROP CONSTRAINT "FK_75c0ee1d89b096cbc2c8ffccd2d"`);
    await queryRunner.query(`ALTER TABLE "usr"."users_promotions" DROP CONSTRAINT "FK_8e7b666b275d42b271beb4b05b4"`);
    await queryRunner.query(`ALTER TABLE "usr"."users_interests" DROP CONSTRAINT "FK_d645bb7af9e9b7a187e7006f10c"`);
    await queryRunner.query(`ALTER TABLE "usr"."users_interests" DROP CONSTRAINT "FK_d49c25558b7a016a8e6675aac8c"`);
    await queryRunner.query(`ALTER TABLE "wdgt"."story_block" DROP CONSTRAINT "FK_30de5737507381e2550841497d7"`);
    await queryRunner.query(`ALTER TABLE "wdgt"."promotions" DROP CONSTRAINT "FK_5fe1e6ebb281dfc1dd765271607"`);
    await queryRunner.query(`ALTER TABLE "cmn"."scans" DROP CONSTRAINT "FK_286c9c1035ae4966cccd4527a16"`);
    await queryRunner.query(`DROP INDEX "chnl"."IDX_00c2f7a6f580c8ff368cb1b2cb"`);
    await queryRunner.query(`DROP INDEX "chnl"."IDX_105e629c9a0f86968497242ce8"`);
    await queryRunner.query(`DROP TABLE "chnl"."channels_widgets"`);
    await queryRunner.query(`DROP INDEX "wdgt"."IDX_72e6fec18e1a2515c835e211ac"`);
    await queryRunner.query(`DROP INDEX "wdgt"."IDX_c76431b534f9c9287986232ecd"`);
    await queryRunner.query(`DROP TABLE "wdgt"."widget_tags"`);
    await queryRunner.query(`DROP INDEX "usr"."IDX_190c6e5996ae16d28ff7971503"`);
    await queryRunner.query(`DROP INDEX "usr"."IDX_116e5accbd837e701845dae638"`);
    await queryRunner.query(`DROP TABLE "usr"."favorites"`);
    await queryRunner.query(`DROP INDEX "usr"."IDX_75c0ee1d89b096cbc2c8ffccd2"`);
    await queryRunner.query(`DROP INDEX "usr"."IDX_8e7b666b275d42b271beb4b05b"`);
    await queryRunner.query(`DROP TABLE "usr"."users_promotions"`);
    await queryRunner.query(`DROP INDEX "usr"."IDX_d645bb7af9e9b7a187e7006f10"`);
    await queryRunner.query(`DROP INDEX "usr"."IDX_d49c25558b7a016a8e6675aac8"`);
    await queryRunner.query(`DROP TABLE "usr"."users_interests"`);
    await queryRunner.query(`DROP TABLE "chnl"."channels"`);
    await queryRunner.query(`DROP TABLE "wdgt"."widgets"`);
    await queryRunner.query(`DROP TABLE "wdgt"."story_block"`);
    await queryRunner.query(`DROP TABLE "wdgt"."tags"`);
    await queryRunner.query(`DROP TABLE "wdgt"."promotions"`);
    await queryRunner.query(`DROP TABLE "usr"."users"`);
    await queryRunner.query(`DROP TABLE "cmn"."interests"`);
    await queryRunner.query(`DROP TABLE "cmn"."scans"`);
  }
}
