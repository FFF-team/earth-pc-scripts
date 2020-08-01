`earth-pc-scripts` 脱胎于 `earth-scripts`，
旨在对PC项目优化react编译打包逻辑，提供更优性能和体验。

`earth-pc-scripts`的build时间对比`earth-scripts`减少35%以上，
对比`react-scripts`更是减少45%以上。
复杂项目的性能提高则更为明显。


## 使用说明

- `earth-pc-scripts`是配合脚手架`generator-earth`所生成的pc项目一起使用。

- `earth-pc-scripts`也可以单独使用，但需要遵守一定的代码格式要求。

- 推荐使用`generator-earth`创建PC项目，并选择`react-pc-typescript`类型，
此时创建的项目会自动包含`earth-pc-scripts`。

- `earth-pc-scripts`信奉`约定优于配置`编程思想和`奥卡姆剃刀`原则。
使用者唯一需要配置的只有`production`环境下的静态资源CDN地址。
新增页面也无需任何配置。



## 性能优化

- 截至2020-8-1，`earth-pc-scripts`所依赖的所有类库都更新至最新版本。

- `earth-pc-scripts`将依赖包从`earth-scripts`的67个大幅减少为30个。
`cnpm install`安装时间减少60%以上。

- `earth-pc-scripts`使用最新的`babel-loader`编译`TypeScript`，
弃用了`ts-loader`，编译速度提升一倍以上。

- `earth-pc-scripts`弃用了`IdModulePlugin`，
转而使用webpack v4.3引入的`contenthash`替代。

- `earth-pc-scripts`弃用了`eslint`，高贵的vscoder不需要`eslint`。
如果确实需要的话请在项目中自行引入。
`earth-pc-scripts`作为编译框架应该更专注于性能和核心功能。

- `earth-pc-scripts`弃用了`jest`和`enzyme`，
单元测试对PC端中后台项目意义不大。

- `earth-pc-scripts`弃用了`UglifyPlugin`。
webpack的`production`模式已经默认启用`UglifyPlugin`，无需重复使用。

- `earth-pc-scripts`弃用了`babel-plugin-import`。
我们的Antd是整体放置在CDN上，编译时的按需加载起不到任何意义。
`earth-pc-scripts`每天的编译次数都在5位数以上，
因此，
在权衡webpack编译性能 vs PC浏览器端JS的加载和执行性能时，
前者胜出。

- `earth-pc-scripts`的entry弃用了polyfill。
这些polyfill和Antd一样已经放置到CDN。无需再在编译时引入。

- 最后也是最重要的一条，
`earth-pc-scripts`弃用了`create-react-app`里80%以上的默认Plugin及Preset。
弃用这些额外的功能使得webpackdevsrv启动速度提高15%以上。
react-pc项目babelrc零配置即可使用。





## 使用.env

项目根目录下添加.env.development或.env.production文件。
这些文件里定义的变量是用来替换react代码中及html模板中的同名变量。


#### 在.env.development文件里定义

```
REACT_VAR_PUBLIC_URL=finance.57.com
```

其中以`REACT_VAR_`开头的变量，会被替换进js和html里


#### 具体规则为

- 在html里的代码，使用`%REACT_VAR_PUBLIC_URL%`替换
- 在js里的代码，使用`process.env.REACT_VAR_PUBLIC_URL`替换

#### 注

`NODE_ENV` 变量不需要定义在上述.env文件中，js和html代码始终都可以获取

#### 在html文件中获取

```
<p>this variable is read from .env file:   %REACT_VAR_PUBLIC_URL%</p>
<p>this variable is read from .env file:   %NODE_ENV%</p>
```

#### 在js文件中获取

```
alert(process.env.REACT_VAR_PUBLIC_URL);

if (process.env.NODE_ENV === 'production') {
    alert('production');
}
```

