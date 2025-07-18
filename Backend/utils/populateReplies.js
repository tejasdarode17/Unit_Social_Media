function populateReplies(depth = 0) {
    const MAX_DEPTH = 5; 
    if (depth > MAX_DEPTH) return null;

    return [
        {
            path: "creator",
            select: "name profilePhoto"
        },
        {
            path: "likes",
            select: "name"
        },
        {
            path: "replies",
            populate: populateReplies(depth + 1)
        }
    ];
}

module.exports = populateReplies