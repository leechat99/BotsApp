const { MessageType } = require("@adiwajshing/baileys");
const translate = require("@vitalets/google-translate-api");
const inputSanitization = require("../sidekick/input-sanitization");
const STRINGS = require("../lib/db");
const format = require("python-format-js");

module.exports = {
    name: "tr",
    description: STRINGS.tr.DESCRIPTION,
    extendedDescription: STRINGS.tr.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: true,
        text: [
            ".tr やめてください",
            ".tr how are you dark| hindi",
            ".tr how are you | hi",
        ],
    },
    async handle(client, chat, BotsApp, args) {
        const processing = await client.sendMessage(
            BotsApp.chatId,
            STRINGS.tr.PROCESSING,
            MessageType.text
        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
        try {
            var text = "";
            var language = "";
            if (args.length == 0) {
                await client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.tr.EXTENDED_DESCRIPTION,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return await client.deleteMessage(BotsApp.chatId, {
                    id: processing.key.id,
                    remoteJid: BotsApp.chatId,
                    fromMe: true,
                });
            }
            if (!BotsApp.isReply) {
                try {
                    var body = BotsApp.body.split("|");
                    text = body[0].replace(
                        BotsApp.body[0] + BotsApp.commandName + " ",
                        ""
                    );
                    var i = 0;
                    while (body[1].split(" ")[i] == "") {
                        i++;
                    }
                    language = body[1].split(" ")[i];
                } catch (err) {
                    if (err instanceof TypeError) {
                        text = BotsApp.body.replace(
                            BotsApp.body[0] + BotsApp.commandName + " ",
                            ""
                        );
                        language = "English";
                    }
                }
            } else if (BotsApp.replyMessage) {
                text = BotsApp.replyMessage;
                language = args[0];
            } else {
                await client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.tr.INVALID_REPLY,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return await client.deleteMessage(BotsApp.chatId, {
                    id: processing.key.id,
                    remoteJid: BotsApp.chatId,
                    fromMe: true,
                });
            }
            if (text.length > 4000) {
                await client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.tr.TOO_LONG.format(text.length),
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return await client.deleteMessage(BotsApp.chatId, {
                    id: processing.key.id,
                    remoteJid: BotsApp.chatId,
                    fromMe: true,
                });
            }
            await translate(text, {
                to: language,
            })
                .then((res) => {
                    client.sendMessage(
                        BotsApp.chatId,
                        STRINGS.tr.SUCCESS.format(
                            res.from.language.iso,
                            language,
                            res.text
                        ),
                        MessageType.text
                    );
                })
                .catch((err) => {
                    inputSanitization.handleError(
                        err,
                        client,
                        BotsApp,
                        STRINGS.tr.LANGUAGE_NOT_SUPPORTED
                    );
                });
            return await client.deleteMessage(BotsApp.chatId, {
                id: processing.key.id,
                remoteJid: BotsApp.chatId,
                fromMe: true,
            });
        } catch (err) {
            inputSanitization.handleError(err, client, BotsApp);
        }
    },
};
