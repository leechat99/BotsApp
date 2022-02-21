const chalk = require('chalk');
const config = require('../config')
const adminCommands = require("../sidekick/input-sanitization").adminCommands;
const sudoCommands = require("../sidekick/input-sanitization").sudoCommands;
const STRINGS = require("../lib/db");
const GENERAL = STRINGS.general;
const Users = require('../database/user');
const { MessageType } = require('@adiwajshing/baileys');

const clearance = async(lechatbot , client, isBlacklist) => {
    if((!lechatbot .fromMe && !lechatbot .isSenderSUDO && !lechatbot .isSenderGroupAdmin) && (isBlacklist)){
        console.log(chalk.blueBright.bold(`[INFO] Blacklisted Chat or User.`));
        return false;
    }
    else if(lechatbot .chatId === "917838204238-1634977991@g.us" || lechatbot .chatId === "120363020858647962@g.us" || lechatbot .chatId === "120363023294554225@g.us"){
        console.log(chalk.blueBright.bold(`[INFO] Blacklisted Chat or User.`));
        return false;
    }
    if (lechatbot .isCmd && (!lechatbot .fromMe && !lechatbot .isSenderSUDO)) {
        if (config.WORK_TYPE.toLowerCase() === "public") {
            if (adminCommands.indexOf(lechatbot .commandName) >= 0 && !lechatbot .isSenderGroupAdmin) {
                console.log(
                    chalk.redBright.bold(`[INFO] admin commmand `),
                    chalk.greenBright.bold(`${lechatbot .commandName}`),
                    chalk.redBright.bold(
                        `not executed in public Work Type.`
                    )
                );
                await client.sendMessage(
                    lechatbot .chatId,
                    GENERAL.ADMIN_PERMISSION,
                    MessageType.text
                );
                return false;
            } else if (sudoCommands.indexOf(lechatbot .commandName) >= 0 && !lechatbot .isSenderSUDO) {
                console.log(
                    chalk.redBright.bold(`[INFO] sudo commmand `),
                    chalk.greenBright.bold(`${lechatbot .commandName}`),
                    chalk.redBright.bold(
                        `not executed in public Work Type.`
                    )
                );
                var messageSent = await Users.getUser(lechatbot .chatId);
                if(messageSent){
                    console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + lechatbot .chatId))
                    return false;
                }
                else{
                    await client.sendMessage(
                        lechatbot .chatId,
                        GENERAL.SUDO_PERMISSION.format({ worktype: "public", groupName: lechatbot .groupName ? lechatbot .groupName : "private chat", commandName: lechatbot .commandName }),
                        MessageType.text,
                        {
                            contextInfo: {
                                stanzaId: lechatbot .chatId,
                                participant: lechatbot .sender,
                                quotedMessage: {
                                    conversation: lechatbot .body,
                                },
                            },
                        }
                    );
                    await Users.addUser(lechatbot .chatId)
                    return false;
                }
                
            }else{
                return true;
            }
        }
        else if(config.WORK_TYPE.toLowerCase() != "public" && !lechatbot .isSenderSUDO){
            console.log(
                chalk.redBright.bold(`[INFO] commmand `),
                chalk.greenBright.bold(`${lechatbot .commandName}`),
                chalk.redBright.bold(
                    `not executed in private Work Type.`
                )
            );
//             var messageSent = await Users.getUser(lechatbot .chatId);
//             if(messageSent){
//                 console.log(chalk.blueBright.bold("[INFO] Promo message had already been sent to " + lechatbot .chatId))
//                 return false;
//             }
//             else{
//                 await client.sendMessage(
//                     lechatbot .chatId,
//                     GENERAL.SUDO_PERMISSION.format({ worktype: "private", groupName: lechatbot .groupName ? lechatbot .groupName : "private chat", commandName: lechatbot .commandName }),
//                     MessageType.text,
//                     {
//                         contextInfo: {
//                             stanzaId: lechatbot .chatId,
//                             participant: lechatbot .sender,
//                             quotedMessage: {
//                                 conversation: lechatbot .body,
//                             },
//                         },
//                     }
//                 );
//                 await Users.addUser(lechatbot .chatId)
//                 return false;
//             }
        }
    }else{
        return true;
    }
}

module.exports = clearance;
