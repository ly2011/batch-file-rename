#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const os = require('os')
const program = require('commander')
const chalk = require('chalk')

/**
 * Usage.
 */

function changeToString (str) {
  return '' + str
}

program
.version(require('./package.json').version)
.usage('[options] <project-name>')
.option('-d, --dir <n>', '请输入你需要替换文件后缀名的文件夹(支持相对路径/绝对路径)', changeToString)
.option('-f, --fromext <n>', '请输入想要替换的后缀名', changeToString)
.option('-t, --toext <n>', '请输入被替换为的后缀名', changeToString)
.parse(process.argv)
/**
 * Help
 */

program
  .on('--help', () => {
    console.log('  Examples:')
    console.log()
    console.log(chalk.gray('    # batch file rename in a project'))
    console.log('    $ batch-file-rename -d my-project -f txt -t md')
    console.log()
  })

/**
 * Settings.
 */

if (!(program.dir && program.fromext && program.toext)) {
  program.help()
}

if (program.fromext.indexOf('.') !== 0) {
  program.fromext = `.${program.fromext}`
}
if (program.toext.indexOf('.') !== 0) {
  program.toext = `.${program.toext}`
}

let rootPath = program.dir
let fromext = program.fromext
let toext = program.toext

// console.log('  - dir %j', program.dir)
// console.log('  - fromext %j', program.fromext)
// console.log('  - toext %j', program.toext)

renameFilesInDir(rootPath)

function changeFileName(filepath) {
  fs.stat(filepath, (err, stats) => {
    if (err) {
      console.error(err)
      return
    }
    if (stats.isFile()) { // 如果是文件则执行
      // 获取文件名
      let filename = path.basename(filepath)
      let parentDir = path.dirname(filepath)
      let parentDirname = path.basename(path.dirname(filepath))
      let thisFilename = path.basename(__filename)
      // console.log(parentDir)

      // 更改文件名的逻辑
      if (filename != thisFilename) {
        // 获取文件后缀名
        // let extname = path.extname(filepath)
        let extArr = path.parse(filename)
        let extname = ''
        let newname = ''
        let newpath = ''
        let isNeedChangeName = false
        if (!!extArr) {
          extname = extArr['ext']
          // 文件后缀为.md.txt
          if (!!extname && extname === fromext && extArr['name'].includes(toext)) {
            newname = extArr['name']
            newpath = path.resolve(parentDir, newname)
            isNeedChangeName = true

          // 后缀为 .txt
          } else if (!!extname && extname === fromext && !!extArr['name']) {
            newname = `${extArr['name']}${toext}`
            newpath = path.resolve(parentDir, newname)
            isNeedChangeName = true
          }
          // console.log(newpath)
          if (isNeedChangeName) { // 判断是否需要重命名
            fs.rename(filepath, newpath, err => {
              if (err) {
                console.error(`${newname} 命名失败`)
              } else {
                console.log(`${newname} 命名成功`)
              }
            })
          } else {
            // 判断文件是否是.md文件, 若不是, 则删除
            // if (!extname.includes(toext)) {
            //   fs.unlink(filepath, err => {
            //     if (err) {
            //       console.error(`${filepath} 删除失败`)
            //     } else {
            //       console.log(`${filepath} 删除成功`)
            //     }
            //   })
            // }
          }
        }
      }
    } else if (stats.isDirectory()) { // 如果是文件夹, 则继续读取该文件下所有的文件
      console.log(`============${filepath} 是文件夹===========`)
      renameFilesInDir(filepath)
    } else {
      console.error('未知类型的文件')
    }
  })
}

function renameFilesInDir(dir) {
  fs.readdir(dir, (err, files) => {
    let absoluteFile = null
    // const len = files.length
    // let file = null
    // for (let i = 0; i < len; i++) {
    //   file = files[i]
    //   absoluteFile = path.resolve(dir, file)
    //   changeFileName(absoluteFile)
    // }
    if (err) {
      console.error(err)
      return
    }
    if (files && files.length) {
      for(let file of files) {
        absoluteFile = path.resolve(dir, file)
        changeFileName(absoluteFile)
      }
    }
  })
}