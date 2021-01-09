const path = require('path')
const express = require('express')
const xss = require('xss')
const foldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        foldersService.getAllFolders(
            req.app.get('db')
        )
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        
        const { name } = req.body
        const newFolder = { name }

        for (const [key, value] of Object.entries(newFolder)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        foldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folderId')
    .all((req, res, next) => {
        foldersService.getById(
            req.app.get('db'),
            req.params.folderId
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder does not exist` }
                    })
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        foldersService.deleteFolder(
            req.app.get('db'),
            req.params.folderId
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const folderToUpdate = { name }
    
        const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
          return res.status(400).json({
            error: {
              message: `Request body must contain a 'name'.`
            }
          })
    
        foldersService.updateFolder(
          req.app.get('db'),
          req.params.folderId,
          folderToUpdate
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
    })


module.exports = foldersRouter