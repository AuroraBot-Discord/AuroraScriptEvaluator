import {
  Client,
  Message,
  Interaction,
  CommandInteraction,
  ButtonInteraction,
  MessageComponentInteraction,
  MessageActionRow,
  MessageButton,
  MessageAttachment,
  Intents
} from "discord.js";
import { join } from "path";
import { pool } from "workerpool";
const worker = pool(join(__dirname, "./worker.js"), {
  workerType: "process"
})

const client: Client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix: string = "^";

const deleteButton: MessageButton = new MessageButton()
  .setCustomId("code_delete")
  .setStyle("SECONDARY")
  .setEmoji("🗑");

const cancelButton: MessageButton = new MessageButton()
  .setCustomId("delete_cancel")
  .setStyle("SECONDARY")
  .setLabel("キャンセル");

const deleteResultButton: MessageButton = new MessageButton()
  .setCustomId("delete_result")
  .setStyle("SECONDARY")
  .setLabel("リザルトを削除する");

const deleteALLButton: MessageButton = new MessageButton()
  .setCustomId("delete_all")
  .setStyle("SECONDARY")
  .setLabel("あなたが送信したコードとリザルトを削除する");

client.on('ready', async () => {
  console.log(`Logged in as ${client.user!.tag}.`)
  await client.application!.commands.set([{
    name: "runjs",
    description: "コードを実行します",
    type: "CHAT_INPUT",
    options: [
      {
        type: "STRING",
        name: "code",
        description: "コード",
        required: true
      }
    ]
  }])
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args: string[] = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift()!.toLowerCase();
  if (command.match(/^runjs/) || command === "run" || command === "eval") {
    let code: any = args.join(" ");
    code = code.replace(/\n?```(js|javascript)\n/, "").replace(/\n```$/, "");
    worker.exec("run", [code])
      .timeout(5000)
      .then(async (result: string) => {
        let m: any;
        if (result.length >= 2000) {
          m = await message.channel.send({ content: "実行結果が長すぎるのでテキストファイルに出力しました。", files: [new MessageAttachment(Buffer.from(result), "result.js")], components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => message.channel.send("Botに`ファイルを添付`の権限がありません。")).catch(() => { });
        } else {
          m = await message.channel.send({ content: "```js\n" + result + "\n```", components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => { });
        }
        const fil = (i: MessageComponentInteraction) => i.customId === "code_delete" && i.user.id === message.author.id;
        m.awaitMessageComponent({ filter: fil, time: 1000 * 15 })
          .then(async (ci: MessageComponentInteraction) => {
            await ci.deferUpdate();
            const msg: Message = await ci.channel!.send({
              embeds: [{
                title: "削除方法を選択してください",
                color: "RANDOM"
              }], components: [new MessageActionRow().addComponents([cancelButton, deleteResultButton, deleteALLButton])]
            });
            const fil2 = (i: MessageComponentInteraction) => i.customId.startsWith("delete_") && i.user.id === message.author.id;
            msg.awaitMessageComponent({ filter: fil2, time: 1000 * 15 })
              .then(async (hou: MessageComponentInteraction) => {
                const houhou: string = hou.customId.split("delete_")[1];
                try {
                  switch (houhou) {
                    case "cancel":
                      await hou.deferUpdate();
                      await m.edit({ components: [] });
                      await msg.delete();
                      break;
                    case "result":
                      await hou.deferUpdate();
                      await m.delete();
                      await msg.delete();
                    case "all":
                      await hou.deferUpdate();
                      await m.delete();
                      await message.delete();
                      await msg.delete();
                      break;
                    default:
                      break;
                  }
                } catch (e) {
                  hou.reply("削除に失敗しました。").catch(() => { })
                }
              })
              .catch(() => msg.delete())
              .catch(() => { });
          })
          .catch(() => m.edit({ components: [] }));
      })
      .catch(async (error: string) => {
        let m: any;
        if (error.length >= 2000) {
          m = await message.channel.send({ content: "エラーが長すぎるのでテキストファイルに出力しました。", files: [new MessageAttachment(Buffer.from(error), "error.js")], components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => message.channel.send("Botに`ファイルを添付`の権限がありません。")).catch(() => { });
        } else {
          m = await message.channel.send({ content: "Error:\n```js\n" + error + "\n```", components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => { });
        }
        const fil = (i: MessageComponentInteraction) => i.customId === "code_delete" && i.user.id === message.author.id;
        m.awaitMessageComponent({ filter: fil, time: 1000 * 15 })
          .then(async (ci: MessageComponentInteraction) => {
            await ci.deferUpdate();
            const msg: Message = await ci.channel!.send({
              embeds: [{
                title: "削除方法を選択してください",
                color: "RANDOM"
              }], components: [new MessageActionRow().addComponents([cancelButton, deleteResultButton, deleteALLButton])]
            });
            const fil2 = (i: MessageComponentInteraction) => i.customId.startsWith("delete_") && i.user.id === message.author.id;
            msg.awaitMessageComponent({ filter: fil2, time: 1000 * 15 })
              .then(async (hou: MessageComponentInteraction) => {
                const houhou: string = hou.customId.split("delete_")[1];
                try {
                  switch (houhou) {
                    case "cancel":
                      await hou.deferUpdate();
                      await msg.delete();
                      break;
                    case "result":
                      await hou.deferUpdate();
                      await m.delete();
                      await msg.delete();
                    case "all":
                      await hou.deferUpdate();
                      await m.delete();
                      await message.delete();
                      await msg.delete();
                      break;
                    default:
                      break;
                  }
                } catch (e) {
                  hou.reply("削除に失敗しました。")
                }
              })
              .catch(() => msg.delete())
              .catch(() => { });
          })
          .catch(() => m.edit({ components: [] }));
      });
  }
});

client.on('interactionCreate', async (i: Interaction) => {
  if (!i.isCommand()) return;
  if (i.commandName === "runjs") {
    await i.deferReply();
    let code: any = i.options.getString("code");
    code = code.replace(/\n?```(js|javascript)\n/, "").replace(/\n```$/, "");
    worker.exec("run", [code])
      .timeout(5000)
      .then(async (result: string) => {
        let m: any;
        if (result.length >= 2000) {
          m = await i.followUp({ content: "実行結果が長すぎるのでテキストファイルに出力しました。", files: [new MessageAttachment(Buffer.from(result), "result.js")], components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => i.followUp("Botに`ファイルを添付`の権限がありません。")).catch(() => { });
        } else {
          m = await i.followUp({ content: "```js\n" + result + "\n```", components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => { });
        }
        const fil = (intr: MessageComponentInteraction) => intr.customId === "code_delete" && intr.user.id === i.user.id;
        m.awaitMessageComponent({ filter: fil, time: 1000 * 15 })
          .then(async (ci: MessageComponentInteraction) => {
            await ci.deferUpdate();
            const msg: Message = await ci.channel!.send({
              embeds: [{
                title: "削除方法を選択してください",
                color: "RANDOM"
              }], components: [new MessageActionRow().addComponents([cancelButton, deleteResultButton])]
            });
            const fil2 = (intr: MessageComponentInteraction) => intr.customId.startsWith("delete_") && intr.user.id === i.user.id;
            msg.awaitMessageComponent({ filter: fil2, time: 1000 * 15 })
              .then(async (hou: MessageComponentInteraction) => {
                const houhou: string = hou.customId.split("delete_")[1];
                try {
                  switch (houhou) {
                    case "cancel":
                      await hou.deferUpdate();
                      await m.edit({ components: [] });
                      await msg.delete();
                      break;
                    case "result":
                      await hou.deferUpdate();
                      await m.delete();
                      await msg.delete();
                    default:
                      break;
                  }
                } catch (e) {
                  hou.reply("削除に失敗しました。").catch(() => { })
                }
              })
              .catch(() => msg.delete())
              .catch(() => { });
          })
          .catch(() => m.edit({ components: [] }));
      })
      .catch(async (error: string) => {
        let m: any;
        if (error.length >= 2000) {
          m = await i.followUp({ content: "エラーが長すぎるのでテキストファイルに出力しました。", files: [new MessageAttachment(Buffer.from(error), "error.js")], components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => i.followUp("Botに`ファイルを添付`の権限がありません。")).catch(() => { });
        } else {
          m = await i.followUp({ content: "Error:\n```js\n" + error + "\n```", components: [new MessageActionRow().addComponents(deleteButton)] }).catch(() => { });
        }
        const fil = (intr: MessageComponentInteraction) => intr.customId === "code_delete" && i.user.id === i.user.id;
        m.awaitMessageComponent({ filter: fil, time: 1000 * 15 })
          .then(async (ci: MessageComponentInteraction) => {
            await ci.deferUpdate();
            const msg: Message = await ci.channel!.send({
              embeds: [{
                title: "削除方法を選択してください",
                color: "RANDOM"
              }], components: [new MessageActionRow().addComponents([cancelButton, deleteResultButton])]
            });
            const fil2 = (intr: MessageComponentInteraction) => intr.customId.startsWith("delete_") && intr.user.id === i.user.id;
            msg.awaitMessageComponent({ filter: fil2, time: 1000 * 15 })
              .then(async (hou: MessageComponentInteraction) => {
                const houhou: string = hou.customId.split("delete_")[1];
                try {
                  switch (houhou) {
                    case "cancel":
                      await hou.deferUpdate();
                      await msg.delete();
                      break;
                    case "result":
                      await hou.deferUpdate();
                      await m.delete();
                      await msg.delete();
                    default:
                      break;
                  }
                } catch (e) {
                  hou.reply("削除に失敗しました。")
                }
              })
              .catch(() => msg.delete())
              .catch(() => { });
          })
          .catch(() => m.edit({ components: [] }));
      });
  }
})

client.login(process.env.token);