import ChatLayout from "@/Layouts/ChatLayout.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {ChatBubbleLeftRightIcon} from "@heroicons/react/24/solid/index.js";
import MessageItem from "@/Components/App/MessageItem.jsx";
import ConversationHeader from "@/Components/App/ConversationHeader.jsx";
import MessageInput from "@/Components/App/MessageInput.jsx";
import {useEventBus} from "@/EventBus.jsx";
import AttachmentPreviewModal from "@/Components/App/AttachmentPreviewModal.jsx";

function Dashboard({ selectedConversation = null, messages = null }) {
    const [initComplete, setInitComplete] = useState(true);
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const messagesCtrlRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const { on } = useEventBus();

    const messageCreated = (message) => {
        console.log(selectedConversation, message);
        if (selectedConversation && selectedConversation.is_group && selectedConversation.id == message.group_id) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
        if (selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id || selectedConversation.id == message.receiver_id)
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    }

    useEffect(() => {
        if (messagesCtrlRef.current) {
            setTimeout(() => {
                messagesCtrlRef.current.scrollTop = messagesCtrlRef.current.scrollHeight;
            }, 10);
        }
        const offCreated = on('message.created', messageCreated);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offCreated();
        }
    }, [selectedConversation]);

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return;
        }

        const firstMessage = localMessages[0];
        axios.get(route('message.loadOlder', firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }
                const scrollHeight = messagesCtrlRef.current.scrollHeight;
                const scrollTop = messagesCtrlRef.current.scrollTop;
                const clientHeight = messagesCtrlRef.current.clientHeight;
                const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
                setScrollFromBottom(tmpScrollFromBottom);

                setLocalMessages((prevMessages) => {
                    return [...data.data.reverse(), ...prevMessages];
                });
            });
    }, [localMessages, noMoreMessages]);

    useEffect(() => {
            setLocalMessages(messages ? messages.data.reverse() : []);
            setTimeout(() => {
                setInitComplete(true);
            }, 100);
    }, [messages]);

    useEffect(() => {
        if (messagesCtrlRef.current && scrollFromBottom !== null) {
            messagesCtrlRef.current.scrollTop =
                messagesCtrlRef.current.scrollHeight -
                messagesCtrlRef.current.offsetHeight -
                scrollFromBottom;
        }
        if (noMoreMessages) {
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.isIntersecting && initComplete && loadMoreMessages()
                });
            }, {
                rootMargin: "0px 0px 250px 0px"
            }
        );

        if (loadMoreIntersect.current) {
            observer.observe(loadMoreIntersect.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [localMessages]);

    const onAttachmentClick = (attachments, ind) => {
        setPreviewAttachment({
            attachments,
            ind
        });
        setShowAttachmentPreview(true);
    }

    return (<>
        {!messages && (
            <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                <div className="text-2xl md:text-4xl p-16 text-slate-200">
                    Please select a conversation to see messages
                </div>
                <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
            </div>
        )}
        {messages && (
            <>
                <ConversationHeader
                    selectedConversation={selectedConversation}
                />
                <div
                    ref={messagesCtrlRef}
                    className="flex-1 overflow-y-auto p-5"
                >
                    {localMessages.length === 0 && (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-lg text-slate-200">
                                No Messages Found
                            </div>
                        </div>
                    )}
                    {localMessages.length > 0 && (
                        <div className="flex-1 flex flex-col">
                            <div ref={loadMoreIntersect}></div>
                            {localMessages.map((message) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    attachmentClick={onAttachmentClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <MessageInput conversation={selectedConversation} />
            </>
        )}

        {previewAttachment.attachments && (
            <AttachmentPreviewModal
                attachments={previewAttachment.attachments}
                index={previewAttachment.ind}
                show={showAttachmentPreview}
                onClose={() => setShowAttachmentPreview(false)}
            />
        )}
    </>);
}

Dashboard.layout = (page) => {
    return (
        <AuthenticatedLayout
            user={page.props.auth.user}
            children={page}
        >
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
}

export default Dashboard;
