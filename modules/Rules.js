const rules = (process.env.RULES ? 
    process.env.RULES
    .trim()
    .split(/\s*\|\s*/)
    .filter(item => item !== '')
    : [])

const ruleList = {
    REGISTER: "register",
    LOGIN: "login",
    UPDATE: "update",
    BEPUBLISHER: "bePublisher",
    MAKEPUBLISHER: "makePublisher"
}

function checkRule(rule) {
    return rules.includes(rule)
}

exports.canRegister = (req, res, next) => {
    if (checkRule(ruleList.REGISTER))
        next()
    else
        res.redirect('/not-found')
}

exports.canLogin = (req, res, next) => {
    if (checkRule(ruleList.LOGIN))
        next()
    else
        res.redirect('/not-found')
}

exports.canUpdate = (req, res, next) => {
    if (checkRule(ruleList.UPDATE))
        next()
    else
        res.redirect('/not-found')
}

exports.canBePublisher = (req, res, next) => {
    if (checkRule(ruleList.BEPUBLISHER))
        next()
    else
        res.redirect('/not-found')
}

exports.canMakePublisher = (req, res, next) => {
    if (checkRule(ruleList.MAKEPUBLISHER))
        next()
    else
        res.redirect('/not-found')
}