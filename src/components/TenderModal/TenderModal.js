import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {archiveTenderById, deleteTenderById, deleteArchivedTenderById} from '../../features/tender/tenderActions';
import { toast } from "react-toastify";
import {
    ColumnsWrapper,
    LeftColumn,
    RightColumn,
    InfoRow,
    InfoBlock,
    ContactInfo,
    ButtonLink,
    ModalOverlay,
    ModalContent,
    Container,
    ScrollableContent,
    ButtonGroup
} from './StyleModal'
import { Button } from '../TenderSearch/StyleSearch'
import Nomenclatures from "../../Blocks/Nomenclatures/Nomenclatures";
import dayjs from "dayjs";

const formatDate = (dateString) => {
    return dayjs(dateString).format("DD/MM/YY в HH:mm");
};

const TenderModal = ({ tender, isOpen, onClose, onDelete, isArchiveView }) => {
    const dispatch = useDispatch();
    const [comment, setComment] = useState(tender.Comment || "");
    const [isEditing, setIsEditing] = useState(false);
    const [hasComment, setHasComment] = useState(!!tender.Comment);

    const handleDelete = () => {
        if (isArchiveView) {
            dispatch(deleteArchivedTenderById(tender.TenderId));
        } else {
            dispatch(deleteTenderById(tender.TenderId));
        }
        onClose();
        toast.success('Тендер удален');
    };

    const handleArchive = () => {
        dispatch(archiveTenderById(tender.TenderId)).then(() => {
            toast.success('Тендер перенесён в архив');
            onClose(); // Закрываем модальное окно
        });
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleSaveComment = () => {
        if (comment.trim()) {
            setHasComment(true);
            setIsEditing(false);
        } else {
            setHasComment(false);
            setIsEditing(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleAddClick = () => {
        if (comment.trim()) {
            setHasComment(true);
            setIsEditing(false);
        }
    };

    const tenderDocumentation = tender.Documents?.find(
        d => d.Title === "Тендерна документація"
    )?.Documents?.[0];

    const handleDownloadDocs = () => {
        if (tenderDocumentation?.Id) {
         const url = `http://localhost:5000/api/tenders/${tender.TenderId}/documents/${tenderDocumentation.Id}/download`;
         window.location.href = url; // браузер начнёт скачивание
        }
    };

    return (
        <>
            <ModalOverlay
                $isOpen={isOpen}
                onClick={onClose}
            >
                <ModalContent onClick={e => e.stopPropagation()}>
                    <Container>
                        <b>Тендер №{tender.TenderId}</b>
                        <ButtonLink
                            onClick={handleDownloadDocs}
                            style={{ marginLeft: 'auto', opacity: tenderDocumentation?.Id ? 1 : 0.5, cursor: tenderDocumentation?.Id ? 'pointer' : 'not-allowed' }}
                            disabled={!tenderDocumentation?.Id}
                        >
                            📄 Тендерна документація
                        </ButtonLink>
                        <ButtonLink
                            href={tender.LinkToTender}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {tender.ProzorroNumber}
                        </ButtonLink>
                        <div>
                            <p>Дата публикации:</p>
                            <p>{formatDate(tender.DatePublished)}</p>
                        </div>
                    </Container>

                    <ScrollableContent>
                        <div>
                            <ColumnsWrapper>
                                <LeftColumn>
                                    <InfoRow>
                                        <InfoBlock>
                                            <strong>Организатор</strong>
                                            <p>{tender.Organizer?.Name}</p>
                                            {tender.Organizer?.ContactPerson && (
                                                <ContactInfo>
                                                    <p>Контактное лицо: {tender.Organizer.ContactPerson.Name}</p>
                                                    <p>Телефон: {tender.Organizer.ContactPerson.Phone}</p>
                                                    <p>Email: {tender.Organizer.ContactPerson.Email}</p>
                                                </ContactInfo>
                                            )}
                                        </InfoBlock>
                                    </InfoRow>
                                    <InfoBlock>
                                        <p><b>Бюджет</b> - {tender.Budget?.AmountTitle} ({tender.Budget?.VatTitle})</p>
                                        <p><b>Участие</b> - {tender.ParticipationCost}</p>
                                        <p><b>Мин. шаг</b> - {tender?.MinimalStepAmount}</p>
                                        <p style={{ marginTop: '10px' }}><b>Очень краткий пересказ</b>: {tender.Description}</p>
                                    </InfoBlock>
                                </LeftColumn>

                                <RightColumn>
                                    <InfoRow>
                                        <InfoBlock>
                                            <strong>Период уточнений</strong>
                                            <p>с {tender.ImportantDates?.EnquiryPeriodStart}</p>
                                            <p> по {tender.ImportantDates?.EnquiryPeriodEnd}</p>
                                        </InfoBlock>
                                        <InfoBlock>
                                            <strong>Приём предложений</strong>
                                            <p>с {tender.ImportantDates?.TenderingPeriodStart}</p>
                                            <p> по {tender.ImportantDates?.TenderingPeriodEnd}</p>
                                        </InfoBlock>
                                        <InfoBlock>
                                            <strong>Аукцион</strong>
                                            <p>{tender.ImportantDates?.AuctionStart}</p>
                                        </InfoBlock>
                                    </InfoRow>

                                    <Nomenclatures tender={tender} />

                                    <strong>Комментарий из {500 - comment.length} символов</strong>
                                    <div>
                                        <textarea
                                            value={comment}
                                            onChange={handleCommentChange}
                                            placeholder="Напишите комментарий..."
                                            rows="4"
                                            maxLength="500"
                                            style={{
                                                width: "515px",
                                                padding: "10px",
                                                borderRadius: "4px",
                                                border: "1px solid #ddd",
                                                backgroundColor: hasComment && !isEditing ? '#f5f5f5' : 'white',
                                                resize: 'vertical'
                                            }}
                                            disabled={hasComment && !isEditing}
                                        />

                                        {!hasComment ? (
                                            <Button
                                                onClick={handleAddClick}
                                                disabled={!comment.trim()}
                                                style={{ marginTop: '10px' }}
                                            >
                                                Добавить
                                            </Button>
                                        ) : (
                                            <div style={{ marginTop: '10px' }}>
                                                {isEditing ? (
                                                    <Button onClick={handleSaveComment}>
                                                        Сохранить
                                                    </Button>
                                                ) : (
                                                    <Button onClick={handleEditClick}>
                                                        Редактировать
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                </RightColumn>
                            </ColumnsWrapper>
                        </div>
                    </ScrollableContent>

                    <ButtonGroup>
                        {isArchiveView ? (
                            <Button onClick={handleDelete}>Удалить</Button>
                        ) : (
                            <Button onClick={handleArchive}>Перенести в архив</Button>
                        )}
                        <Button onClick={onClose}>ОК</Button>
                    </ButtonGroup>
                </ModalContent>
            </ModalOverlay>
        </>
    );
};

export default TenderModal;
