'use strict';

const express = require('express');
const graphql = require("express-graphql");

const {
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} = require('graphql');

const users = [
    { id: '1', name: 'Maxim' },
    { id: '2', name: 'Alex' }
];

const notes = [
    { id: '1', name: 'Books', text: 'Books to read' },
    { id: '2', name: 'Music', text: 'Music to listen' }
];

const comments = [
    { noteId: '1', userId: '1', text: 'Круто!' },
    { noteId: '1', userId: '2', text: 'А мне не очень понравилось' }
];

const server = express();

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString }
    }
});

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: {
        text: { type: GraphQLString },
        author: {
            type: UserType,
            resolve: parentValue =>
                users.find(user => user.id === parentValue.userId)
        }
    }
});

const NoteType = new GraphQLObjectType({
    name: 'Note',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        text: { type: GraphQLString },
        comments: {
            type: new GraphQLList(CommentType),
            args: {
                userId: { type: GraphQLID }
            },
            resolve: (parentValue, { userId }) =>
                comments.filter(comment =>
                    comment.noteId === parentValue.id && (!userId || userId === comment.userId)
                )
        }
    }
});

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        notes: {
            type: new GraphQLList(NoteType),
            resolve: () => notes
        },
        note: {
            type: NoteType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (parentValue, { name }) =>
                notes.find(note => note.name === name)
        }
    }
});

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createNote: {
            type: NoteType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                text: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (parentValue, { name, text }) => {
                const note = { id: Math.random(), name, text };

                notes.push(note);

                return note;
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType
});

server.use('/graphql', graphql({ schema, graphiql: true }));

server.listen(3000, () =>
    console.log('Listening on http://localhost:3000/graphql')
);