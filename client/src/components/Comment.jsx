import { useState } from "react";
import { IconButton } from "./IconButton";
import { FaHeart, FaRegHeart, FaReply, FaEdit, FaTrash } from "react-icons/fa";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";
import { useAsyncFn } from "../hooks/useAsync";
import { useUser } from "../hooks/useUser";
import { usePost } from "../contexts/PostContext";
import {
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "../services/comments";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function Comment({
  id,
  message,
  user,
  createdAt,
  likeCount,
  likedByMe,
}) {
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {
    post,
    getReplies,
    createLocalComment,
    updateLocalComment,
    deleteLocalComment,
    toggleLocalCommentLike,
  } = usePost();
  const {
    loading,
    error,
    execute: createCommentFn,
  } = useAsyncFn(createComment);
  const {
    loadingUpdate,
    errorUpdate,
    execute: updateCommentFn,
  } = useAsyncFn(updateComment);
  const {
    loadingDelete,
    errorDelete,
    execute: deleteCommentFn,
  } = useAsyncFn(deleteComment);
  const toggleCommentLikeFn = useAsyncFn(toggleCommentLike);
  const childComments = getReplies(id);
  const currentUser = useUser();

  function onCommentReply(message) {
    return createCommentFn({ postId: post.id, message, parentId: id }).then(
      (comment) => {
        setIsReplying(false);
        createLocalComment(comment);
      }
    );
  }

  function onCommentUpdate(message) {
    return updateCommentFn({ postId: post.id, message, id }).then((comment) => {
      setIsEditing(false);
      updateLocalComment(id, comment.message);
    });
  }

  function onCommentDelete() {
    return deleteCommentFn({ postId: post.id, id }).then((comment) =>
      deleteLocalComment(comment.id)
    );
  }

  function onToggleCommentLike() {
    return toggleCommentLikeFn
      .execute({ id, postId: post.id })
      .then(({ addLike }) => toggleLocalCommentLike(id, addLike));
  }

  return (
    <>
      <div className="comment">
        <div className="header">
          <span className="name">{user.name}</span>
          <span className="date">
            {dateFormatter.format(Date.parse(createdAt))}
          </span>
        </div>
        {isEditing ? (
          <CommentForm
            autoFocus
            initialValue={message}
            onSubmit={onCommentUpdate}
            loading={loadingUpdate}
            error={errorUpdate}
          />
        ) : (
          <div className="message">{message}</div>
        )}
        <div className="footer">
          <IconButton
            onClick={onToggleCommentLike}
            disabled={toggleCommentLikeFn.loading}
            Icon={likedByMe ? FaHeart : FaRegHeart}
            aria-label={likedByMe ? "UnLike" : "Like"}
          >
            {likeCount}
          </IconButton>
          <IconButton
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
            Icon={FaReply}
            aria-label={isReplying ? "Cancel Reply" : "Reply"}
          />
          {user.id === currentUser.id && (
            <>
              <IconButton
                disabled={loadingDelete}
                onClick={() => setIsEditing((prev) => !prev)}
                isActive={isEditing}
                Icon={FaEdit}
                aria-label={isEditing ? "Cancel Edit" : "Edit"}
              />
              <IconButton
                onClick={onCommentDelete}
                Icon={FaTrash}
                aria-label="Delete"
                color="danger"
              />
            </>
          )}
        </div>
        {errorDelete && <div className="error-msg mt-1">{errorDelete}</div>}
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={loading}
            error={error}
          />
        </div>
      )}
      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? "hide" : ""
            }`}
          >
            <button
              className="collapse-line"
              aria-label="Hide Replies"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
}
