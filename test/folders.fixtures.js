function makeFoldersArray() {
    return [
        {
            id: 1,
            name: 'First test post!'
        },
        {
            id: 2,
            name: 'Second test post!'
        },
        {
            id: 3,
            name: 'Third test post!'
        },
        {
            id: 4,
            name: 'Fourth test post!'
        },
    ];
}

function makeMaliciousFolder() {
    const maliciousFolder = {
      id: 911,
      name: 'Naughty naughty very naughty <script>alert("xss");</script>'
    }
    const expectedFolder = {
      ...maliciousFolder,
      name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'      
    }
    return {
      maliciousFolder,
      expectedFolder,
    }
}
  
module.exports = {
    makeFoldersArray,
    makeMaliciousFolder,
}