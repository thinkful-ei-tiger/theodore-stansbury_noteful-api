const path = require('path')
const express = require('express')
const xss = require('xss')
const notesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    folderId: note.folderId,
    name: xss(note.name),
    content: xss(note.content),
    modified: note.modified
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        notesService.getAllNotes(
            req.app.get('db')
        )
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        
        const { folderId, name, content } = req.body
        const newNote = { folderId, name, content }

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        notesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })

notesRouter
    .route('/:noteId')
    .all((req, res, next) => {
        notesService.getById(
            req.app.get('db'),
            req.params.noteId
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note does not exist` }
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        notesService.deleteNote(
            req.app.get('db'),
            req.params.noteId
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { folderId, name, content } = req.body
        const noteToUpdate = { folderId, name, content }
    
        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
          return res.status(400).json({
            error: {
              message: `Request body must contain a 'name', 'content', and 'folder'.`
            }
          })
    
        notesService.updateNote(
          req.app.get('db'),
          req.params.noteId,
          noteToUpdate
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
    })


module.exports = notesRouter