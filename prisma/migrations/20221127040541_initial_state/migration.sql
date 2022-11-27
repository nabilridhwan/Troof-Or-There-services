-- CreateTable
CREATE TABLE " game" (
    "room_id" VARCHAR NOT NULL DEFAULT '',
    "status" VARCHAR NOT NULL,
    "game_type" BIGINT NOT NULL,
    "room_created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT " game_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "game_type" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "game_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log" (
    "action" VARCHAR NOT NULL,
    "game_room_id" VARCHAR NOT NULL,
    "player_id" UUID NOT NULL,
    "data" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("game_room_id","player_id","created_at")
);

-- CreateTable
CREATE TABLE "player" (
    "player_id" TEXT NOT NULL,
    "display_name" VARCHAR NOT NULL,
    "joined_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "game_room_id" VARCHAR NOT NULL,
    "is_party_leader" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "player_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "player_sequence" (
    "game_room_id" VARCHAR NOT NULL,
    "sequence" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "current_player_id" UUID NOT NULL,

    CONSTRAINT "player_sequence_pkey" PRIMARY KEY ("game_room_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_type_id_key" ON "game_type"("id");

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_game_room_id_fkey" FOREIGN KEY ("game_room_id") REFERENCES " game"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_game_room_id_fkey" FOREIGN KEY ("game_room_id") REFERENCES " game"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_sequence" ADD CONSTRAINT "player_sequence_current_player_id_fkey" FOREIGN KEY ("current_player_id") REFERENCES "player"("player_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player_sequence" ADD CONSTRAINT "player_sequence_game_room_id_fkey" FOREIGN KEY ("game_room_id") REFERENCES " game"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
