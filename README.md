# AuroraScriptEvaluator
JavaScriptのコードを実行することができます。
(しかし、`require`や`process`、`setTimeout`やdiscord.jsのモジュールなどは使用できません。)

[Botを導入する](https://discord.com/api/oauth2/authorize?client_id=884292743776583710&permissions=0&scope=applications.commands%20bot)
## インストール
Replitではそのまま使用することが(たぶん)できます。  
他の環境では、`index.ts`と`worker.ts`をコンパイルした後に`index.js`を実行してください。
## 使用方法
```js
^eval const arr = ["apple", "orange", "grape"];
arr[Math.floor(Math.random() * arr.length)]
```
`apple`か`orange`か`grape`が返ってきます。
[![test image](https://i.gyazo.com/6a84cc3b7e1ebea2af34a3f2e1e99a61.png)](https://gyazo.com/6a84cc3b7e1ebea2af34a3f2e1e99a61)

もしくは、コードブロックで囲むことができます。
````md
^eval ```js
const arr = ["apple", "orange", "grape"];
arr[Math.floor(Math.random() * arr.length)]
```
````
[![test image](https://i.gyazo.com/307c102a8beb13307fa7a42ba9a1097f.png)](https://gyazo.com/307c102a8beb13307fa7a42ba9a1097f)