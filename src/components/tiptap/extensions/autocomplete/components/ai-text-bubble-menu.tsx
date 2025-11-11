import * as React from "react"
import type { Editor } from "@tiptap/react"
import { createPortal } from "react-dom"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Tooltip from "@mui/material/Tooltip"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import { textTransformActions  as textActions } from "../main-index"

interface AITextBubbleMenuProps {
    editor: Editor
}


// Minimal MUI dialog for demonstration
const TextTransformDialog: React.FC<{
    isOpen: boolean
    onClose: () => void
    onAccept: (text: string) => void
    onReject: () => void
    originalText: string
    action: string
}> = ({ isOpen, onClose, onAccept, onReject, originalText, action }) => (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>AI Text Transform: {action}</DialogTitle>
        <DialogContent>
            <Typography variant="body2" gutterBottom>
                Original Text:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body1">{originalText}</Typography>
            </Paper>
            {/* Replace below with streaming/AI output */}
            <Typography variant="body2" color="text.secondary">
                (AI transformed text would appear here)
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onAccept(originalText)}>Accept</Button>
            <Button onClick={onReject}>Reject</Button>
        </DialogActions>
    </Dialog>
);

export const AITextBubbleMenu: React.FC<AITextBubbleMenuProps> = ({ editor }) => {
    const [selectedText, setSelectedText] = React.useState("")
    const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [currentAction, setCurrentAction] = React.useState<string>("")
    const [selectionRange, setSelectionRange] = React.useState<{ from: number; to: number } | null>(null)
    const [showMenu, setShowMenu] = React.useState(false)

    const updateSelectedText = React.useCallback(() => {
        const { from, to } = editor.state.selection
        const text = editor.state.doc.textBetween(from, to, " ")
        setSelectedText(text)
        setSelectionRange({ from, to })
        try {
            const endCoords = editor.view.coordsAtPos(to)
            setPosition({
                top: endCoords.bottom + 8,
                left: endCoords.right - 10
            })
        } catch {
            setPosition(null)
        }
    }, [editor])

    React.useEffect(() => {
        const handleSelectionChange = () => {
            const { from, to } = editor.state.selection
            if (from === to || !editor.isEditable) {
                setShowMenu(false)
                return
            }
            const text = editor.state.doc.textBetween(from, to, " ").trim()
            if (text.length < 5) {
                setShowMenu(false)
                return
            }
            updateSelectedText()
            setShowMenu(true)
        }
        editor.on('selectionUpdate', handleSelectionChange)
        editor.on('update', handleSelectionChange)
        return () => {
            editor.off('selectionUpdate', handleSelectionChange)
            editor.off('update', handleSelectionChange)
        }
    }, [editor, updateSelectedText])

    const handleTextTransform = React.useCallback((action: string) => {
        if (!selectedText.trim()) return
        setCurrentAction(action)
        setDialogOpen(true)
        setShowMenu(false)
    }, [selectedText])

    const handleAcceptTransform = React.useCallback((transformedText: string) => {
        if (!selectionRange) return
        editor
            .chain()
            .focus()
            .setTextSelection(selectionRange)
            .deleteSelection()
            .insertContent(transformedText)
            .run()
    }, [editor, selectionRange])

    const handleRejectTransform = React.useCallback(() => {}, [])

    const handleDialogClose = React.useCallback(() => {
        setDialogOpen(false)
        setCurrentAction("")
    }, [])

    return (
        <>
            {/* Bubble Menu */}
            {showMenu && position && createPortal(
                <Paper
                    elevation={6}
                    sx={{
                        position: "fixed",
                        top: position.top,
                        left: position.left,
                        minWidth: 180,
                        maxWidth: 220,
                        zIndex: 1500,
                        borderRadius: 2,
                        overflow: "hidden"
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} px={2} py={1} bgcolor="grey.100">
                        <AutoFixHighIcon style={{ width: 20, height: 20 }} />
                        <Typography variant="subtitle2">AI Edit</Typography>
                    </Box>
                    <Divider />
                    <Box py={1}>
                        {textActions.map((action) => (
                            <Tooltip key={action.id} title={action.description} placement="right">
                                <Button
                                    fullWidth
                                    startIcon={action.icon ? <action.icon /> : null}
                                    sx={{ justifyContent: "flex-start", textTransform: "none", fontSize: 14, py: 1 }}
                                    onClick={() => handleTextTransform(action.id)}
                                >
                                    {action.label}
                                </Button>
                            </Tooltip>
                        ))}
                    </Box>
                </Paper>,
                document.body
            )}

            {/* Streaming Dialog */}
            <TextTransformDialog
                isOpen={dialogOpen}
                onClose={handleDialogClose}
                onAccept={handleAcceptTransform}
                onReject={handleRejectTransform}
                originalText={selectedText}
                action={currentAction}
            />
        </>
    )
}